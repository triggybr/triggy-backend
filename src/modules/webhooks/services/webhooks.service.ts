import { BadRequestException, Injectable, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ErrorCodes } from 'src/common/codes';
import { uuidGenerator } from 'src/common/utils/uuid-generator';
import { User, UserDocument } from 'src/modules/user/schemas/user.schema';
import { UserIntegration, UserIntegrationDocument } from '../../integrations/schemas/user-integration.schema';
import { UserStats, UserStatsDocument } from '../../integrations/schemas/user-stats.schema';
import { Signature, SignatureDocument } from '../../user/schemas/signature.schema';
import { ListWebhooksDto } from '../dto/list-webhooks.dto';
import { ProcessWebhookDto } from '../dto/process-webhook.dto';
import { Webhook, WebhookDocument } from '../schemas/webhook.schema';
import { EventMappingOrchestrator } from './event-mapping.orchestrator';

@Injectable()
export class WebhooksService {
  private logger = new Logger(WebhooksService.name);

  constructor(
    @InjectModel(Webhook.name) private readonly webhookModel: Model<WebhookDocument>,
    @InjectModel(UserIntegration.name) private readonly userIntegrationModel: Model<UserIntegrationDocument>,
    @InjectModel(UserStats.name) private readonly userStatsModel: Model<UserStatsDocument>,
    @InjectModel(Signature.name) private readonly signatureModel: Model<SignatureDocument>,
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
    private readonly eventMappingOrchestrator: EventMappingOrchestrator,
  ) {}

  async listWebhooks(listWebhooksDto: ListWebhooksDto) {
    const { page = 1, limit = 10, integrationId, status, startDate, endDate } = listWebhooksDto;

    const filters = {};

    if (integrationId) {
      filters['userIntegrationId'] = integrationId;
    }
    if (status) {
      filters['status'] = status;
    }
    if (startDate || endDate) {
      filters['triggeredAt'] = {};
      if (startDate) filters['triggeredAt']['$gte'] = new Date(startDate);
      if (endDate) filters['triggeredAt']['$lte'] = new Date(endDate);
    }

    const skip = (page - 1) * limit;
    const [webhooks, total] = await Promise.all([
      this.webhookModel.find(filters).sort({ triggeredAt: -1 }).skip(skip).limit(limit).lean(),
      this.webhookModel.countDocuments(filters).lean(),
    ]);

    const integrationIds = [...new Set(webhooks.map(webhook => webhook.userIntegrationId).filter(Boolean))];
    
    const integrations = integrationIds.length > 0 
      ? await this.userIntegrationModel.find({ id: { $in: integrationIds } }).lean()
      : [];

    const integrationMap = new Map(integrations.map(integration => [integration.id, integration]));

    return {
      webhooks: webhooks.map(webhook => this.mapWebhook(webhook, integrationMap.get(webhook.userIntegrationId))),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
      filters: {
        integrationId: integrationId,
        status: status?.toLocaleLowerCase(),
        startDate: startDate,
        endDate: endDate,
      }
    };
  }

  async processWebhook(dto: ProcessWebhookDto) {
    const { urlCode, payload } = dto;

    const userIntegration = await this.userIntegrationModel.findOne({ urlCode }).lean();
    if (!userIntegration) {
      this.logger.error('UserIntegration not found');
      return;
    }

    const userId = userIntegration.userId;

    const userStats = await this.userStatsModel.findOne({ userId }).lean();
    if (!userStats) {
      this.logger.error('UserStats not found');
      return;
    }

    const signature = await this.signatureModel.findOne({ userId }).lean();
    if (!signature) {
      this.logger.error('Signature not found');
      return;
    }

    if (!(signature.webhookQuota > userStats.usedWebhookQuota)) {
      this.logger.error('Webhook quota exceeded');
      return;
    }

    const now = new Date().toISOString();

    const webhook: Partial<Webhook> = {
      id: uuidGenerator(),
      userId,
      userIntegrationId: userIntegration.id,
      requestBody: JSON.stringify(payload),
      endpoint: userIntegration.destination.url,
      method: 'POST',
      triggeredAt: now,
      updatedAt: now,
    };

    try {
      const { responseBody, responseStatus, responseTime } = await this.eventMappingOrchestrator.execute(payload, userIntegration);
      webhook.status = 'SUCCESS';
      webhook.responseBody = JSON.stringify(responseBody);
      webhook.responseStatus = responseStatus;
      webhook.responseTime = responseTime;
      
      await this.userIntegrationModel.updateOne({ id: userIntegration.id }, { $inc: { successCount: 1 } }).lean();
    } catch (error) {
      const webhookError = {
        message: error.message || 'Unknown error',
        code: error.code,
        details: error.stack
      };
      webhook.status = 'ERROR';
      webhook.error = webhookError;

      await this.userIntegrationModel.updateOne({ id: userIntegration.id }, { $inc: { errorCount: 1 } }).lean();
      this.logger.error(`Event mapping failed: ${error.message}`);
    }

    try {
      await this.webhookModel.create(webhook);
      await this.userStatsModel.updateOne({ userId }, { $inc: { usedWebhookQuota: 1 } }).lean();
    } catch (error) {
      this.logger.error(`Failed to save webhook record: ${error.message}`);
    }
  }

  async retryWebhook(externalId: string, webhookId: string) {
    const user = await this.userModel.findOne({ externalId }).lean();
    if (!user) throw new NotFoundException({
      message: 'User not found',
      code: ErrorCodes.USER_NOT_FOUND,
    });

    const userId = user.id
    
    const originalWebhook = await this.webhookModel.findOne({ 
      id: webhookId,
      userId: userId 
    }).lean();

    if (!originalWebhook) {
      throw new NotFoundException({
        message: 'Webhook not found',
        code: ErrorCodes.WEBHOOK_NOT_FOUND,
      });
    }

    const userIntegration = await this.userIntegrationModel.findOne({
      id: originalWebhook.userIntegrationId,
      userId: userId
    }).lean();

    if (!userIntegration) {
      throw new NotFoundException({
        message: 'Integration not found',
        code: ErrorCodes.INTEGRATION_NOT_FOUND,
      });
    }

    const userStats = await this.userStatsModel.findOne({ userId: userId }).lean();
    if (!userStats) {
      throw new NotFoundException({
        message: 'User stats not found',
        code: ErrorCodes.USER_STATS_NOT_FOUND,
      });
    }

    const signature = await this.signatureModel.findOne({ userId: userId }).lean();
    if (!signature) {
      throw new NotFoundException({
        message: 'Signature not found',
        code: ErrorCodes.SIGNATURE_NOT_FOUND,
      });
    }

    if (!(signature.webhookQuota > userStats.usedWebhookQuota)) {
      throw new BadRequestException({
        message: 'Webhook quota exceeded',
        code: ErrorCodes.WEBHOOK_QUOTA_EXCEEDED,
      });
    }

    const now = new Date().toISOString();

    const newWebhook: Partial<Webhook> = {
      id: uuidGenerator(),
      userId: userId,
      userIntegrationId: originalWebhook.userIntegrationId,
      requestBody: originalWebhook.requestBody,
      endpoint: userIntegration.destination.url,
      method: originalWebhook.method,
      triggeredAt: now,
      updatedAt: now,
      isRetry: true,
      originalWebhookId: originalWebhook.id,
    };

    try {
      const payload = JSON.parse(originalWebhook.requestBody)
      const { responseBody, responseStatus, responseTime } = await this.eventMappingOrchestrator.execute(payload, userIntegration);
      newWebhook.status = 'SUCCESS';
      newWebhook.responseBody = JSON.stringify(responseBody);
      console.log(responseBody)
      newWebhook.responseStatus = responseStatus;
      newWebhook.responseTime = responseTime;

      await this.userIntegrationModel.updateOne({ id: userIntegration.id }, { $inc: { successCount: 1 } }).lean();
    } catch (error) {
      const webhookError = {
        message: error.message || 'Unknown error',
        code: error.code,
        details: error.stack
      };
      newWebhook.status = 'ERROR';
      newWebhook.error = webhookError;

      await this.userIntegrationModel.updateOne({ id: userIntegration.id }, { $inc: { errorCount: 1 } }).lean();
    }

    try {
      await this.webhookModel.create(newWebhook);
      await this.userStatsModel.updateOne({ userId: userId }, { $inc: { usedWebhookQuota: 1 } }).lean();
    } catch (error) {
      this.logger.error(`Failed to save webhook record: ${error.message}`);
      throw new InternalServerErrorException({
        message: 'Internal server error',
        code: ErrorCodes.INTERNAL_SERVER_ERROR
      })
    }

    return {
      success: true,
      message: 'Webhook reenviado com sucesso',
      newWebhookId: newWebhook.id,
      retriedAt: now,
    };
  }

  private mapWebhook(webhook: Webhook, integration?: any) {
    const result: any = {
      id: webhook.id,
      integrationId: webhook.userIntegrationId,
      status: webhook.status?.toLowerCase(),
      endpoint: webhook.endpoint,
      method: webhook.method,
      requestBody: webhook.requestBody,
      responseBody: webhook.responseBody ?? null,
      responseStatus: webhook.responseStatus ?? null,
      responseTime: webhook.responseTime ?? null,
      error: webhook.error ?? null,
      triggeredAt: webhook.triggeredAt,
      isRetry: webhook.isRetry || false,
      originalWebhookId: webhook.originalWebhookId,
    };

    if (integration) {
      result.integration = {
        id: integration.id,
        name: integration.name,
        source: {
          platform: integration.source?.platform || 'unknown',
          name: integration.source?.name || 'Unknown',
          color: integration.source?.color || 'bg-gray-500',
          url: integration.source?.url,
          description: integration.source?.description,
          event: integration.source?.event,
          eventDescription: integration.source?.eventDescription,
        },
        destination: {
          platform: integration.destination?.platform || 'unknown',
          name: integration.destination?.name || 'Unknown',
          color: integration.destination?.color || 'bg-gray-500',
          url: integration.destination?.url,
          description: integration.destination?.description,
          action: integration.destination?.action,
          actionDescription: integration.destination?.actionDescription,
        }
      };
    }

    return result;
  }
}

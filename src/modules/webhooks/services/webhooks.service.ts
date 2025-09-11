import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { ListWebhooksDto } from '../dto/list-webhooks.dto';
import { Webhook, WebhookDocument } from '../schemas/webhook.schema';
import { ProcessWebhookDto } from '../dto/process-webhook.dto';
import { UserIntegration, UserIntegrationDocument } from '../../integrations/schemas/user-integration.schema';
import { UserStats, UserStatsDocument } from '../../integrations/schemas/user-stats.schema';
import { Signature, SignatureDocument } from '../../user/schemas/signature.schema';
import { uuidGenerator } from 'src/common/utils/uuid-generator';
import { EventMappingOrchestrator } from './event-mapping.orchestrator';

@Injectable()
export class WebhooksService {
  private logger = new Logger(WebhooksService.name);

  constructor(
    @InjectModel(Webhook.name) private readonly webhookModel: Model<WebhookDocument>,
    @InjectModel(UserIntegration.name) private readonly userIntegrationModel: Model<UserIntegrationDocument>,
    @InjectModel(UserStats.name) private readonly userStatsModel: Model<UserStatsDocument>,
    @InjectModel(Signature.name) private readonly signatureModel: Model<SignatureDocument>,
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
      if (startDate) filters['triggeredAt']['$gte'] = new Date(startDate);
      if (endDate) filters['triggeredAt']['$lte'] = new Date(endDate);
    }

    const skip = (page - 1) * limit;
    const [webhooks, total] = await Promise.all([
      this.webhookModel.find(filters).sort({ triggeredAt: -1 }).skip(skip).limit(limit).lean(),
      this.webhookModel.countDocuments().lean(),
    ]);

    return {
      webhooks: webhooks.map(this.mapWebhook),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
      filters: {
        integrationId: integrationId ?? null,
        status: status ?? null,
        startDate: startDate ?? null,
        endDate: endDate ?? null,
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
      webhook.responseBody = responseBody;
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

  private mapWebhook(webhook) {
    return {
        id: webhook.id,
        integrationId: webhook.userIntegrationId,
        status: webhook.status,
        endpoint: webhook.endpoint,
        method: webhook.method,
        requestBody: webhook.requestBody,
        responseBody: webhook.responseBody ?? null,
        responseStatus: webhook.responseStatus ?? null,
        responseTime: webhook.responseTime ?? null,
        error: webhook.error ?? null,
        triggeredAt: webhook.triggeredAt,
    }
  }
}

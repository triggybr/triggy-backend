import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ErrorCodes } from 'src/common/codes';
import { uuidGenerator } from 'src/common/utils/uuid-generator';
import { User, UserDocument } from '../user/schemas/user.schema';
import { CreateIntegrationDto } from './dto/create-integration.dto';
import { FindAllUserIntegrationsQueryDto } from './dto/find-all-user-integrations';
import { UpdateIntegrationDto } from './dto/update-integration.dto';
import { Integration, IntegrationDocument } from './schemas/integration.schema';
import { UserIntegration, UserIntegrationDocument } from './schemas/user-integration.schema';
import { UserStats, UserStatsDocument } from './schemas/user-stats.schema';
import { Signature, SignatureDocument } from '../user/schemas/signature.schema';

@Injectable()
export class IntegrationsService {
  constructor(
    @InjectModel(UserIntegration.name) private readonly userIntegrationModel: Model<UserIntegrationDocument>,
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
    @InjectModel(UserStats.name) private readonly userStatsModel: Model<UserStatsDocument>,
    @InjectModel(Integration.name) private readonly integrationModel: Model<IntegrationDocument>,
    @InjectModel(Signature.name) private readonly signatureModel: Model<SignatureDocument>,
  ) { }

  async createUserIntegration(externalId: string, dto: CreateIntegrationDto) {
    const user = await this.userModel.findOne({ externalId }).lean();
    if (!user) throw new NotFoundException({
      message: 'User not found',
      code: ErrorCodes.USER_NOT_FOUND,
    });

    const userStats = await this.userStatsModel.findOne({ userId: user.id }).lean();
    if (!userStats) throw new NotFoundException({
      message: 'UserStats not found',
      code: ErrorCodes.USER_STATS_NOT_FOUND,
    });

    const signature = await this.signatureModel.findOne({ userId: user.id }).lean();
    if (!signature) throw new NotFoundException({
      message: 'Signature not found',
      code: ErrorCodes.SIGNATURE_NOT_FOUND,
    });

    const planIntegrationQuota = signature.integrationQuota ?? 0;
    const usedIntegrationQuota = userStats.usedIntegrationQuota ?? 0;
    if (!(planIntegrationQuota > usedIntegrationQuota)) {
      throw new BadRequestException({
        message: 'Integration quota exceeded',
        code: ErrorCodes.INTEGRATION_QUOTA_EXCEEDED,
      });
    }

    const now = new Date().toISOString();

    const urlCode = uuidGenerator();
    const integration = await this.userIntegrationModel.create({
      id: uuidGenerator(),
      userId: user.id,
      userStatsId: userStats.id,
      urlCode,
      name: dto.name,
      source: dto.source,
      destination: dto.destination,
      status: { value: 'ACTIVE', label: 'Ativo' },
      successCount: 0,
      errorCount: 0,
      createdAt: now,
      updatedAt: now,
    });

    await this.userStatsModel.updateOne({ id: userStats.id }, { $inc: { usedIntegrationQuota: 1 } });

    return this.mapUserIntegrationToResponse(integration.toObject());
  }

  async findAllUserIntegrations(externalUserId: string, query: FindAllUserIntegrationsQueryDto) {
    const user = await this.userModel.findOne({ externalId: externalUserId }).lean();
    if (!user) throw new NotFoundException({
      message: 'User not found',
      code: ErrorCodes.USER_NOT_FOUND,
    });

    const filter = {
      userId: user.id,
    };
    if (query.status) { filter['status.value'] = query.status; }
    if (query.source) { filter['source.platform'] = query.source; }

    const [items, total] = await Promise.all([
      this.userIntegrationModel.find(filter).skip(query.offset).limit(query.limit).sort({ createdAt: -1 }).lean(),
      this.userIntegrationModel.countDocuments().lean(),
    ]);

    return {
      integrations: items.map(this.mapUserIntegrationToResponse),
      total,
      limit: query.limit,
      offset: query.offset
    };
  }

  async updateUserIntegration(externalId: string, id: string, dto: UpdateIntegrationDto) {
    const { name, status, destinationUrl } = dto;

    const user = await this.userModel.findOne({ externalId }).lean();
    if (!user) throw new NotFoundException({
      message: 'User not found',
      code: ErrorCodes.USER_NOT_FOUND,
    });

    const updateData: any = { updatedAt: new Date().toISOString() };

    if (name) updateData.name = name;
    if (status) {
      updateData.status = {
        value: status,
        label: status === 'active' ? 'Ativo' : 'Inativo'
      };
    }
    if (destinationUrl) {
      updateData['destination.url'] = destinationUrl;
    }

    const updatedIntegration = await this.userIntegrationModel.findOneAndUpdate(
      { id, userId: user.id },
      { $set: updateData },
      { new: true }
    ).lean();

    if (!updatedIntegration) throw new NotFoundException({
      message: 'Integration not found',
      code: ErrorCodes.INTEGRATION_NOT_FOUND
    });

    return this.mapUserIntegrationToResponse(updatedIntegration);
  }

  async removeUserIntegration(externalId: string, id: string) {
    const user = await this.userModel.findOne({ externalId }).lean();
    if (!user) throw new NotFoundException({
      message: 'User not found',
      code: ErrorCodes.USER_NOT_FOUND,
    });

    const item = await this.userIntegrationModel.findOneAndDelete({
      id,
      userId: user.id
    }).lean();

    if (!item) throw new NotFoundException({
      message: 'Integration not found',
      code: ErrorCodes.INTEGRATION_NOT_FOUND
    });

    await this.userStatsModel.updateOne({ id: item.userStatsId }, { $inc: { usedIntegrationQuota: -1 } });

    return {
      message: 'Integração excluída com sucesso'
    };
  }

  async getAvailableIntegrations(filter?: { source?: string }) {
    const query = {};
    if (filter?.source) query['platform'] = filter.source;

    const integrations = await this.integrationModel.find(query).lean();

    return {
      integrations: integrations.map(this.mapIntegrationToResponse)
    };
  }

  async findUserIntegrationById(externalId: string, id: string) {
    const user = await this.userModel.findOne({ externalId }).lean();
    if (!user) {
      throw new NotFoundException({ message: 'User not found', code: ErrorCodes.USER_NOT_FOUND });
    }

    const integration = await this.userIntegrationModel.findOne({ userId: user.id, id }).lean();
    if (!integration) {
      throw new NotFoundException({ message: 'Integration not found', code: ErrorCodes.INTEGRATION_NOT_FOUND });
    }

    return this.mapUserIntegrationToResponse(integration);
  }

  async findIntegrations(externalId: string, filters: { status?: 'active' | 'inactive', source?: string, limit: number, offset: number }) {
    const user = await this.userModel.findOne({ externalId }).lean();
    if (!user) {
      throw new NotFoundException({ message: 'User not found', code: ErrorCodes.USER_NOT_FOUND });
    }

    const query: any = { userId: user.id };
    
    if (filters.status) {
      query['status.value'] = filters.status;
    }
    
    if (filters.source) {
      query['source.platform'] = filters.source;
    }

    const integrations = await this.userIntegrationModel
      .find(query)
      .limit(filters.limit)
      .skip(filters.offset)
      .lean();

    const total = await this.userIntegrationModel.countDocuments(query);

    return {
      integrations: integrations.map(integration => this.mapUserIntegrationToResponse(integration)),
      total,
      limit: filters.limit,
      offset: filters.offset
    };
  }

  private mapUserIntegrationToResponse(integration) {
    return {
      id: integration.id,
      name: integration.name ?? null,
      source: integration.source,
      destination: integration.destination,
      webhookUrl: `${process.env.API_URL}/v1/webhooks/${integration.urlCode}`,
      status: integration.status,
      createdAt: integration.createdAt,
      updatedAt: integration.updatedAt,
      lastTriggered: integration.lastTriggered ?? null,
      successCount: integration.successCount ?? 0,
      errorCount: integration.errorCount ?? 0,
    };
  };

  private mapIntegrationToResponse(integration) {
    return {
      id: integration.id,
      platform: integration.platform,
      name: integration.name,
      color: integration.color,
      description: integration.description,
      events: integration.events,
    }
  }
} 
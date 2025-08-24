import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Webhook, WebhookDocument } from './schemas/webhook.schema';
import { ListWebhooksDto } from './dto/list-webhooks.dto';

@Injectable()
export class WebhooksService {
  constructor(@InjectModel(Webhook.name) private readonly webhookModel: Model<WebhookDocument>) {}

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
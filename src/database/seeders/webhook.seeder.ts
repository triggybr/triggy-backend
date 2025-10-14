import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Webhook, WebhookDocument } from '../../modules/webhooks/schemas/webhook.schema';

@Injectable()
export class WebhookSeeder implements OnModuleInit {
  constructor(
    @InjectModel(Webhook.name) private readonly webhookModel: Model<WebhookDocument>,
  ) { }

  async onModuleInit() {
    await this.seed();
  }

  async seed() {
    const environment = process.env.ENVIRONMENT || 'staging';
    if (environment == 'production') {
      console.log('Skipping integration seeding in non-development environment');
      return;
    }

    const count = await this.webhookModel.countDocuments();

    if (count === 0) {
      console.log('Seeding webhooks...');
      const webhooks: Partial<Webhook>[] = [
        {
          id: 'wh_1234567890',
          userId: 'user_123',
          userIntegrationId: 'int_123',
          status: 'SUCCESS',
          endpoint: 'https://webhook.site/12345678-1234-1234-1234-1234567890ab',
          method: 'POST',
          requestBody: JSON.stringify({ event: 'payment.received', amount: 100, currency: 'BRL' }),
          responseBody: JSON.stringify({ success: true, message: 'Webhook received' }),
          responseStatus: 200,
          responseTime: 150,
          triggeredAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: 'wh_0987654321',
          userId: 'user_123',
          userIntegrationId: 'int_456',
          status: 'ERROR',
          endpoint: 'https://webhook.site/09876543-0987-0987-0987-0987654321ba',
          method: 'POST',
          requestBody: JSON.stringify({ event: 'payment.failed', amount: 50, currency: 'BRL' }),
          error: {
            message: 'Connection timeout',
            code: 'ETIMEDOUT',
            details: 'Could not connect to the webhook endpoint within 5 seconds',
          },
          triggeredAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ];

      await this.webhookModel.insertMany(webhooks);
      console.log('Webhooks seeded successfully!');
    } else {
      console.log('Webhooks already seeded, skipping...');
    }
  }

  async clear() {
    await this.webhookModel.deleteMany({});
  }
}

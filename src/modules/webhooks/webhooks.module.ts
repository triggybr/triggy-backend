import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { WebhooksController } from './webhooks.controller';
import { WebhooksService } from './webhooks.service';
import { Webhook, WebhookSchema } from './schemas/webhook.schema';

@Module({
  imports: [MongooseModule.forFeature([{ name: Webhook.name, schema: WebhookSchema }])],
  controllers: [WebhooksController],
  providers: [WebhooksService],
  exports: [WebhooksService],
})
export class WebhooksModule {} 
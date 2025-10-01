import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type WebhookDocument = Webhook & Document;

@Schema()
export class Webhook {
  @Prop({ unique: true })
  id: string;

  @Prop({ index: true })
  userId: string;

  @Prop({ index: true })
  userIntegrationId: string;

  @Prop({ enum: ['SUCCESS', 'ERROR'] })
  status: 'SUCCESS' | 'ERROR';

  @Prop()
  endpoint: string;

  @Prop({ enum: ['POST', 'GET', 'PUT', 'DELETE'] })
  method: 'POST' | 'GET' | 'PUT' | 'DELETE';

  @Prop()
  requestBody: string;

  @Prop()
  responseBody?: string;

  @Prop()
  responseStatus?: number;

  @Prop()
  responseTime?: number;

  @Prop({ type: Object })
  error?: { message: string; code?: string; details?: string };

  @Prop({ index: true })
  triggeredAt: string;

  @Prop()
  updatedAt: string;

  @Prop({ default: false })
  isRetry: boolean;

  @Prop()
  originalWebhookId?: string;
}

export const WebhookSchema = SchemaFactory.createForClass(Webhook); 
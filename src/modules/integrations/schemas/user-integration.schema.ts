import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type UserIntegrationDocument = UserIntegration & Document;

@Schema({ collection: 'user_integrations' })
export class UserIntegration {
  @Prop({ unique: true })
  id: string;

  @Prop({ index: true })
  userId: string;

  @Prop()
  userStatsId: string;

  @Prop({ unique: true })
  urlCode: string;

  @Prop()
  name?: string;

  @Prop({ type: Object })
  source: {
    platform: string;
    name?: string;
    event: string;
    eventDescription?: string;
  };

  @Prop({ type: Object })
  destination: {
    platform: string;
    name?: string;
    action: string;
    actionDescription?: string;
    additionalFields?: Array<{ name: string; value: string }>;
  };

  @Prop({ type: Object })
  status: { value: 'ACTIVE' | 'INACTIVE'; label: string };

  @Prop({ default: 0 })
  successCount: number;

  @Prop({ default: 0 })
  errorCount: number;

  @Prop()
  lastTriggered?: string;

  @Prop({ type: Object, required: false })
  orderBump?: Record<string, string>;

  @Prop()
  createdAt: string;

  @Prop()
  updatedAt: string;
}

export const UserIntegrationSchema = SchemaFactory.createForClass(UserIntegration); 
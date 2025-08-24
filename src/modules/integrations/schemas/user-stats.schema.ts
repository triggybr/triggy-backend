import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type UserStatsDocument = UserStats & Document;

@Schema({ collection: 'user_stats' })
export class UserStats {
  @Prop({ unique: true })
  id: string;

  @Prop({ unique: true, index: true })
  userId: string;

  @Prop({ default: 0 })
  usedWebhookQuota: number;

  @Prop({ default: 0 })
  usedIntegrationQuota: number;
}

export const UserStatsSchema = SchemaFactory.createForClass(UserStats); 
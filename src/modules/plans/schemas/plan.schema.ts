import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type PlanDocument = Plan & Document;

@Schema()
export class Plan {
  @Prop({ unique: true })
  id: string;

  @Prop()
  name: string;

  @Prop()
  priceValue: number;

  @Prop()
  icon: string;

  @Prop()
  description: string;

  @Prop({ type: [String], default: [] })
  features: string[];

  @Prop({ default: false })
  popular: boolean;

  @Prop()
  webhookQuota: number;

  @Prop()
  integrationQuota: number;

  @Prop()
  logViewQuota: number;
}

export const PlanSchema = SchemaFactory.createForClass(Plan);
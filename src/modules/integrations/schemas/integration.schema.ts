import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type IntegrationDocument = Integration & Document;

@Schema({ _id: true, timestamps: true })
export class Integration {
  @Prop({ unique: true })
  id: string;

  @Prop({ unique: true })
  platform: string;

  @Prop()
  name: string;

  @Prop()
  description: string;

  @Prop({ type: [Object] })
  events: {
    name: string;
    description: string;
    destinations: {
      platform: string;
      name: string;
      description?: string;
      additionalFields: string[];
      actions: {
        name: string;
        description: string;
      }[];
    }[];
  }[];

  @Prop({ type: Date, default: Date.now })
  createdAt: Date;

  @Prop({ type: Date, default: Date.now })
  updatedAt: Date;
}

export const IntegrationSchema = SchemaFactory.createForClass(Integration);
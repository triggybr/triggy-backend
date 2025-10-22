import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose";

export type SignatureDocument = Signature & Document;

@Schema()
export class Signature {
  @Prop({ unique: true })
  id: string;

  @Prop({ unique: true })
  userId: string;

  @Prop()
  planId: string;

  @Prop()
  last4: string;

  @Prop({ unique: true })
  externalId: string;

  @Prop()
  couponCode?: string;

  @Prop()
  type: string;

  @Prop()
  priceValue: number;

  @Prop()
  active: boolean;

  @Prop()
  nextBillingDate: string;

  @Prop()
  webhookQuota: number;

  @Prop()
  integrationQuota: number;

  @Prop()
  logViewQuota: number;

  @Prop()
  createdAt: string;

  @Prop()
  updatedAt: string;
}

export const SignatureSchema = SchemaFactory.createForClass(Signature);
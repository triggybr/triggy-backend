import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type CouponDocument = Coupon & Document;

@Schema()
export class Coupon {
  @Prop({ unique: true })
  id: string;

  @Prop({ unique: true })
  code: string;

  @Prop()
  discount: number;

  @Prop({ enum: ['FIXED', 'PERCENT'] })
  type: 'FIXED' | 'PERCENT';

  @Prop()
  description: string;

  @Prop({ default: true })
  valid: boolean;
}

export const CouponSchema = SchemaFactory.createForClass(Coupon); 
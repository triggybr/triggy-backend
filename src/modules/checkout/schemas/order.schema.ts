import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type OrderDocument = Order & Document;

@Schema()
export class Order {
  @Prop({ unique: true })
  id: string;

  @Prop({ index: true })
  userId: string;
  
  @Prop({ unique: true })
  externalId: string;

  @Prop()
  priceValue: number;

  @Prop({ index: true, enum: ['PENDING', 'APPROVED', 'REJECTED', 'REFUNDED'] })
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'REFUNDED';

  @Prop({ enum: ['CARD'] })
  paymentMethod: 'CARD';

  @Prop({ type: Object })
  coupon?: {
    code: string;
    discount: number;
    type: 'FIXED' | 'PERCENT';
    description: string;
  };

  @Prop({ type: Number, default: 0 })
  discountValue: number;

  @Prop()
  approvedAt?: string;

  @Prop()
  rejectedAt?: string;

  @Prop({ type: String })
  rejectedReason?: string;

  @Prop()
  refundedAt?: string;

  @Prop({ type: String })
  refundedReason?: string;

  @Prop({ index: true })
  createdAt: string;

  @Prop()
  updatedAt: string;
}

export const OrderSchema = SchemaFactory.createForClass(Order);
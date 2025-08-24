import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type UserDocument = User & Document;

@Schema()
export class User {
  @Prop({ unique: true })
  id: string;

  @Prop({ unique: true })
  externalId: string;

  @Prop()
  gatewayId?: string;

  @Prop({ unique: true })
  email: string;

  @Prop({ type: Object })
  document?: {
    type: 'CPF' | 'CNPJ';
    document: string;
  };

  @Prop()
  createdAt: string;

  @Prop()
  updatedAt: string;
}

export const UserSchema = SchemaFactory.createForClass(User); 
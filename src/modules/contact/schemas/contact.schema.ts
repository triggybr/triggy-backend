import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose";

export type ContactDocument = Contact & Document;

export enum AssuntoEnum {
  VENDAS = 'vendas',
  SUPORTE = 'suporte',
  INTEGRACAO = 'integracao',
  PARCERIA = 'parceria',
  OUTRO = 'outro',
}

@Schema()
export class Contact {
    @Prop({ unique: true })
    id: string;

    @Prop()
    nome: string;
  
    @Prop()
    email: string;
  
    @Prop()
    empresa?: string;
  
    @Prop({ enum: AssuntoEnum })
    assunto: AssuntoEnum;
  
    @Prop()
    mensagem: string;
}

export const ContactSchema = SchemaFactory.createForClass(Contact); 
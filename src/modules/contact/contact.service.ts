import { Injectable, Logger } from '@nestjs/common';
import { SendContactDto } from './dto/send-contact.dto';
import { ContactResponseDto, MessageStatusEnum } from './dto/contact-response.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Contact, ContactDocument } from './schemas/contact.schema';
import { uuidGenerator } from 'src/common/utils/uuid-generator';

@Injectable()
export class ContactService {
  private readonly logger = new Logger(ContactService.name);

  constructor(
    @InjectModel(Contact.name) private readonly contactModel: Model<ContactDocument>,
  ) {}

  async sendContactMessage(dto: SendContactDto): Promise<ContactResponseDto> {
    this.logger.log('='.repeat(60));
    this.logger.log('Nova mensagem de contato recebida');
    this.logger.log('='.repeat(60));
    this.logger.log(`Nome: ${dto.nome}`);
    this.logger.log(`Email: ${dto.email}`);
    this.logger.log(`Empresa: ${dto.empresa || 'Não informada'}`);
    this.logger.log(`Assunto: ${dto.assunto}`);
    this.logger.log(`Mensagem: ${dto.mensagem}`);
    this.logger.log('='.repeat(60));

    const contact: Contact = {
      id: uuidGenerator(),
      nome: dto.nome,
      email: dto.email,
      empresa: dto.empresa,
      assunto: dto.assunto,
      mensagem: dto.mensagem,
    }
    await this.contactModel.create(contact)

    return {
      messageId: contact.id,
      status: MessageStatusEnum.SENT,
    };
  }
}


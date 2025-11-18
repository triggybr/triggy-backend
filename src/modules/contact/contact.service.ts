import { Injectable, Logger } from '@nestjs/common';
import { SendContactDto } from './dto/send-contact.dto';
import { ContactResponseDto, MessageStatusEnum } from './dto/contact-response.dto';

@Injectable()
export class ContactService {
  private readonly logger = new Logger(ContactService.name);

  async sendContactMessage(dto: SendContactDto): Promise<ContactResponseDto> {
    // Log detalhado das informações recebidas
    this.logger.log('='.repeat(60));
    this.logger.log('Nova mensagem de contato recebida');
    this.logger.log('='.repeat(60));
    this.logger.log(`Nome: ${dto.nome}`);
    this.logger.log(`Email: ${dto.email}`);
    this.logger.log(`Empresa: ${dto.empresa || 'Não informada'}`);
    this.logger.log(`Assunto: ${dto.assunto}`);
    this.logger.log(`Mensagem: ${dto.mensagem}`);
    this.logger.log('='.repeat(60));

    // Por enquanto, retornamos um mock de sucesso
    return {
      messageId: null,
      status: MessageStatusEnum.SENT,
    };
  }
}


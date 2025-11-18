import { Body, Controller, HttpCode, HttpStatus, Logger, Post } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { ContactService } from './contact.service';
import { SendContactDto } from './dto/send-contact.dto';
import { ContactResponseDto } from './dto/contact-response.dto';
import { Public } from 'src/common/decorators/public.decorator';

@ApiTags('Contact')
@Public()
@Controller('contact')
export class ContactController {
  private readonly logger = new Logger(ContactController.name);

  constructor(private readonly contactService: ContactService) {}

  @Post()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ 
    summary: 'Enviar mensagem de contato',
    description: 'Envia uma mensagem através do formulário de contato utilizando Mailchimp Transactional (Mandrill)',
  })
  @ApiResponse({
    status: 200,
    description: 'Mensagem enviada com sucesso',
    type: ContactResponseDto,
  })
  @ApiResponse({ 
    status: 400, 
    description: 'Dados inválidos',
  })
  @ApiResponse({ 
    status: 500, 
    description: 'Erro ao enviar mensagem',
  })
  async sendContact(@Body() dto: SendContactDto): Promise<ContactResponseDto> {
    try {
      return await this.contactService.sendContactMessage(dto);
    } catch (error) {
      this.logger.error('Erro ao processar mensagem de contato:', error);
      throw error;
    }
  }
}


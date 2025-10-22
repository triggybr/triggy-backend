import { Controller, Get, Logger, Param, Post, Query } from '@nestjs/common';
import { ApiOperation, ApiParam, ApiResponse, ApiTags, ApiQuery } from '@nestjs/swagger';
import { ActiveUserExternalId } from 'src/common/decorators/active-user-id.decorator';
import { ListWebhooksDto } from './dto/list-webhooks.dto';
import { WebhooksService } from './services/webhooks.service';
import { WebhooksResponseDto } from './dto/webhooks-responses.dto';

@ApiTags('Webhooks')
@Controller('webhooks')
export class WebhooksController {
  private logger = new Logger(WebhooksController.name)

  constructor(private readonly webhooksService: WebhooksService) {}

  @Get()
  @ApiOperation({ summary: 'Buscar webhooks disparados' })
  @ApiResponse({ status: 200, description: 'Lista de webhooks retornada com sucesso.', type: WebhooksResponseDto })
  @ApiResponse({ status: 400, description: 'Parâmetros inválidos.' })
  @ApiResponse({ status: 401, description: 'Token de autenticação inválido.' })
  @ApiResponse({ status: 500, description: 'Erro interno do servidor.' })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Página a ser retornada (padrão 1)' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Número de itens por página (padrão 20, máximo 100)' })
  @ApiQuery({ name: 'integrationId', required: false, type: String, description: 'Filtrar por ID de integração específica' })
  @ApiQuery({ name: 'status', required: false, enum: ['success', 'error'], description: 'Filtrar por status do webhook' })
  async list(
    @ActiveUserExternalId() externalId: string,
    @Query() query: ListWebhooksDto
  ): Promise<WebhooksResponseDto> {
    try {
      return this.webhooksService.listWebhooks(externalId, query);
    } catch (error) {
      this.logger.error(error)
      throw error
    }
  }

  @Post(':id/retry')
  @ApiOperation({ summary: 'Reenviar webhook com falha' })
  @ApiParam({ name: 'id', description: 'ID do webhook a ser reenviado' })
  @ApiResponse({ 
    status: 200, 
    description: 'Webhook reenviado com sucesso',
  })
  async retryWebhook(
    @ActiveUserExternalId() userId: string,
    @Param('id') webhookId: string
  ) {
    return await this.webhooksService.retryWebhook(userId, webhookId);
  }
} 
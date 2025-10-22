import { ApiProperty } from '@nestjs/swagger';

export class WebhookErrorDto {
  @ApiProperty({ 
    description: 'Mensagem de erro',
    example: 'Canal não encontrado'
  })
  message: string;

  @ApiProperty({ 
    description: 'Código do erro',
    example: 'CHANNEL_NOT_FOUND',
    nullable: true
  })
  code?: string;

  @ApiProperty({ 
    description: 'Detalhes do erro',
    example: 'O canal especificado não existe ou foi removido',
    nullable: true
  })
  details?: string;
}

export class WebhookPlatformDto {
  @ApiProperty({ 
    description: 'Identificador da plataforma',
    example: 'hotmart'
  })
  platform: string;

  @ApiProperty({ 
    description: 'Nome da plataforma',
    example: 'Hotmart'
  })
  name: string;

  @ApiProperty({ 
    description: 'URL da plataforma',
    example: 'https://app.astronmembers.com/integrations/webhooks',
    nullable: true
  })
  url?: string;

  @ApiProperty({ 
    description: 'Descrição da plataforma',
    example: 'Plataforma de produtos digitais',
    nullable: true
  })
  description?: string;

  @ApiProperty({ 
    description: 'Evento que dispara a integração (apenas origem)',
    example: 'purchase_completed',
    nullable: true
  })
  event?: string;

  @ApiProperty({ 
    description: 'Descrição legível do evento (apenas origem)',
    example: 'Compra finalizada com sucesso',
    nullable: true
  })
  eventDescription?: string;

  @ApiProperty({ 
    description: 'Ação executada no destino (apenas destino)',
    example: 'create_member',
    nullable: true
  })
  action?: string;

  @ApiProperty({ 
    description: 'Descrição legível da ação (apenas destino)',
    example: 'Criar membro na área',
    nullable: true
  })
  actionDescription?: string;

  @ApiProperty({ 
    description: 'Chave de API configurada (apenas destino, não exibida na UI)',
    example: null,
    nullable: true
  })
  apiKey?: string;
}

export class WebhookIntegrationDto {
  @ApiProperty({ 
    description: 'ID da integração',
    example: 'integration-001'
  })
  id: string;

  @ApiProperty({ 
    description: 'Nome personalizado da integração',
    example: 'Membros do Rumo ao Milhão',
    nullable: true
  })
  name?: string;

  @ApiProperty({ 
    description: 'Informações da plataforma de origem',
    type: WebhookPlatformDto
  })
  source: WebhookPlatformDto;

  @ApiProperty({ 
    description: 'Informações da plataforma de destino',
    type: WebhookPlatformDto
  })
  destination: WebhookPlatformDto;
}

export class WebhookDto {
  @ApiProperty({ 
    description: 'ID do webhook',
    example: 'webhook-001'
  })
  id: string;

  @ApiProperty({ 
    description: 'ID da integração',
    example: 'integration-001'
  })
  integrationId: string;

  @ApiProperty({ 
    description: 'Informações da integração',
    type: WebhookIntegrationDto
  })
  integration: WebhookIntegrationDto;

  @ApiProperty({ 
    description: 'Status do webhook',
    enum: ['success', 'error'],
    example: 'success'
  })
  status: 'success' | 'error';

  @ApiProperty({ 
    description: 'URL do endpoint',
    example: 'https://discord.com/api/webhooks/123456'
  })
  endpoint: string;

  @ApiProperty({ 
    description: 'Método HTTP',
    enum: ['POST', 'GET', 'PUT', 'DELETE'],
    example: 'POST'
  })
  method: 'POST' | 'GET' | 'PUT' | 'DELETE';

  @ApiProperty({ 
    description: 'String JSON do corpo da requisição enviada',
    example: '{"event": "purchase", "user": {"name": "João Silva"}}'
  })
  requestBody: string;

  @ApiProperty({ 
    description: 'String JSON do corpo da resposta recebida',
    example: '{"success": true, "messageId": "msg_123"}',
    nullable: true
  })
  responseBody?: string;

  @ApiProperty({ 
    description: 'Código de status HTTP da resposta',
    example: 200,
    nullable: true
  })
  responseStatus?: number;

  @ApiProperty({ 
    description: 'Tempo de resposta em milissegundos',
    example: 145,
    nullable: true
  })
  responseTime?: number;

  @ApiProperty({ 
    description: 'Informações de erro se o webhook falhou',
    type: WebhookErrorDto,
    nullable: true
  })
  error?: WebhookErrorDto;

  @ApiProperty({ 
    description: 'Quando o webhook foi disparado',
    example: '2024-01-21T14:30:00Z'
  })
  triggeredAt: string;
}

export class WebhookFiltersDto {
  @ApiProperty({ 
    description: 'Filtrar por ID de integração',
    example: 'integration-001',
    nullable: true
  })
  integrationId?: string;

  @ApiProperty({ 
    description: 'Filtrar por status do webhook',
    enum: ['success', 'error'],
    example: 'success',
    nullable: true
  })
  status?: string | null;
}

export class WebhookPaginationDto {
  @ApiProperty({ 
    description: 'Número da página atual',
    minimum: 1,
    example: 1
  })
  page: number;

  @ApiProperty({ 
    description: 'Número de itens por página',
    minimum: 1,
    maximum: 100,
    example: 20
  })
  limit: number;

  @ApiProperty({ 
    description: 'Número total de webhooks',
    minimum: 0,
    example: 150
  })
  total: number;
}

export class WebhooksResponseDto {
  @ApiProperty({ 
    description: 'Lista de webhooks',
    type: [WebhookDto]
  })
  webhooks: WebhookDto[];

  @ApiProperty({ 
    description: 'Informações de paginação',
    type: WebhookPaginationDto
  })
  pagination: WebhookPaginationDto;

  @ApiProperty({ 
    description: 'Filtros aplicados',
    type: WebhookFiltersDto
  })
  filters: WebhookFiltersDto;
}
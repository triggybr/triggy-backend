import { ApiProperty } from '@nestjs/swagger';

class AdditionalFields {
  @ApiProperty({ example: 'apiKey' })
  name: string;
  
  @ApiProperty({ example: 'Sua chave de API' })
  value: string;
}
export class PlatformDto {
  @ApiProperty({ example: 'hotmart' })
  platform: string;

  @ApiProperty({ example: 'Hotmart' })
  name: string;

  @ApiProperty({ example: 'Plataforma de produtos digitais', required: false })
  description?: string;

  @ApiProperty({ example: 'purchase_completed', required: false })
  event?: string;

  @ApiProperty({ example: 'Compra finalizada com sucesso', required: false })
  eventDescription?: string;

  @ApiProperty({ example: 'create_member', required: false })
  action?: string;

  @ApiProperty({ type: [AdditionalFields], required: false })
  additionalFields?: AdditionalFields[];

  @ApiProperty({ example: 'Criar membro na área', required: false })
  actionDescription?: string;
}

export class IntegrationStatusDto {
  @ApiProperty({ example: 'active', enum: ['active', 'inactive'] })
  value: string;

  @ApiProperty({ example: 'Ativo' })
  label: string;
}

export class IntegrationDto {
  @ApiProperty({ example: 'integration-001' })
  id: string;

  @ApiProperty({ example: 'Membros do Rumo ao Milhão', required: false })
  name?: string;

  @ApiProperty({ type: PlatformDto })
  source: PlatformDto;

  @ApiProperty({ type: PlatformDto })
  destination: PlatformDto;

  @ApiProperty({ example: 'https://api.conectaplus.com/webhook/hotmart-astronmembers-001' })
  webhookUrl: string;

  @ApiProperty({ type: IntegrationStatusDto })
  status: IntegrationStatusDto;

  @ApiProperty({ example: '2024-01-15T10:30:00Z' })
  createdAt: string;

  @ApiProperty({ example: '2024-01-21T14:30:00Z' })
  updatedAt: string;

  @ApiProperty({ example: '2024-01-21T14:30:00Z', required: false })
  lastTriggered?: string;

  @ApiProperty({ example: 1247 })
  successCount: number;

  @ApiProperty({ example: 3 })
  errorCount: number;
}

export class IntegrationsResponseDto {
  @ApiProperty({ type: [IntegrationDto] })
  integrations: IntegrationDto[];

  @ApiProperty({ example: 3 })
  total: number;

  @ApiProperty({ example: 10 })
  limit: number;

  @ApiProperty({ example: 0 })
  offset: number;
}

export class ActionDto {
  @ApiProperty({ example: 'create_member' })
  name: string;

  @ApiProperty({ example: 'Criar membro na área' })
  description: string;
}

export class AvailableDestinationDto {
  @ApiProperty({ example: 'astronmembers' })
  platform: string;

  @ApiProperty({ example: 'AstronMembers' })
  name: string;

  @ApiProperty({ example: true })
  requiresUrl: boolean;

  @ApiProperty({ example: true })
  requiresApiKey: boolean;

  @ApiProperty({ example: 'Área de membros', required: false })
  description?: string;

  @ApiProperty({ type: [ActionDto] })
  actions: ActionDto[];
}

export class EventDto {
  @ApiProperty({ example: 'purchase_completed' })
  name: string;

  @ApiProperty({ example: 'Compra finalizada com sucesso' })
  description: string;

  @ApiProperty({ type: [AvailableDestinationDto] })
  destinations: AvailableDestinationDto[];
}

export class AvailableIntegrationDto {
  @ApiProperty({ example: 'hotmart' })
  id: string;

  @ApiProperty({ example: 'hotmart' })
  platform: string;

  @ApiProperty({ example: 'Hotmart' })
  name: string;

  @ApiProperty({ example: 'Plataforma de produtos digitais', required: false })
  description?: string;

  @ApiProperty({ type: [EventDto] })
  events: EventDto[];
}

export class AvailableIntegrationsResponseDto {
  @ApiProperty({ type: [AvailableIntegrationDto] })
  integrations: AvailableIntegrationDto[];
}

export class DeleteIntegrationResponseDto {
  @ApiProperty({ example: 'Integração excluída com sucesso' })
  message: string;
}
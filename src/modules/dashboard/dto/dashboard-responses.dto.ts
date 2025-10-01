import { ApiProperty } from '@nestjs/swagger';

class ComparisonPreviousPeriodDto {
  @ApiProperty({ description: 'Webhooks usados no período anterior', example: 1150 })
  webhooksUsed: number;

  @ApiProperty({ description: 'Taxa de sucesso no período anterior', example: 97.2 })
  successRate: number;
}

class ComparisonPercentageChangeDto {
  @ApiProperty({ description: 'Mudança percentual em webhooks', example: 8.4 })
  webhooks: number;

  @ApiProperty({ description: 'Mudança percentual na taxa de sucesso', example: 1.3 })
  successRate: number;
}

class ComparisonDto {
  @ApiProperty({ description: 'Dados do período anterior', type: ComparisonPreviousPeriodDto })
  previousPeriod: ComparisonPreviousPeriodDto;

  @ApiProperty({ description: 'Mudanças percentuais', type: ComparisonPercentageChangeDto })
  percentageChange: ComparisonPercentageChangeDto;
}

export class DashboardStatsResponseDto {
  @ApiProperty({ description: 'Número de webhooks usados', example: 1247 })
  webhooksUsed: number;

  @ApiProperty({ description: 'Limite de uso de webhooks', example: 5000 })
  webhooksLimit: number;

  @ApiProperty({ description: 'Número de integrações criadas', example: 3 })
  integrationsCreated?: number;

  @ApiProperty({ description: 'Percentual de taxa de sucesso', example: 98.5 })
  successRate: number;

  @ApiProperty({ description: 'Comparação com período anterior', type: ComparisonDto, nullable: true })
  comparison?: ComparisonDto;
}

export class ChartDataItemDto {
  @ApiProperty({ description: 'Data', example: '2024-01-15' })
  date: string;

  @ApiProperty({ description: 'Número de webhooks', example: 178 })
  webhooks: number;

  @ApiProperty({ description: 'Número de webhooks bem-sucedidos', example: 175 })
  successCount: number;

  @ApiProperty({ description: 'Número de webhooks com falha', example: 3 })
  errorCount: number;

  @ApiProperty({ description: 'Número de webhooks pendentes', example: 0 })
  pendingCount: number;
}

class ChartSummaryPeakDto {
  @ApiProperty({ description: 'Valor de pico', example: 298 })
  value: number;

  @ApiProperty({ description: 'Data do pico', example: '2024-01-18' })
  date: string;
}

class ChartSummaryDto {
  @ApiProperty({ description: 'Total de webhooks', example: 1401 })
  total: number;

  @ApiProperty({ description: 'Média de webhooks por dia', example: 200.1 })
  average: number;

  @ApiProperty({ description: 'Dados de pico', type: ChartSummaryPeakDto })
  peak: ChartSummaryPeakDto;

  @ApiProperty({ description: 'Direção da tendência', enum: ['up', 'down', 'stable'], example: 'up' })
  trend: string;
}

export class DashboardChartDataResponseDto {
  @ApiProperty({ description: 'Pontos de dados do gráfico', type: [ChartDataItemDto] })
  data: ChartDataItemDto[];

  @ApiProperty({ description: 'Estatísticas resumidas', type: ChartSummaryDto })
  summary: ChartSummaryDto;
}

class RecentActivityPayloadDto {
  @ApiProperty({ description: 'Tamanho do payload em bytes', example: 1024 })
  size: number;

  @ApiProperty({ description: 'Tipo de conteúdo', example: 'application/json' })
  contentType: string;
}

class RecentActivityResponseDto {
  @ApiProperty({ description: 'Código de status HTTP', example: 200, nullable: true })
  statusCode: number | null;

  @ApiProperty({ description: 'Cabeçalhos de resposta', example: { 'content-type': 'application/json' } })
  headers: object;
}

export class DashboardRecentActivitiesResponseDto {
  @ApiProperty({ description: 'ID do webhook', example: 'webhook-001' })
  id: string;

  @ApiProperty({ description: 'Descrição da integração', example: 'Hotmart → ZapFacil' })
  integration: string;

  @ApiProperty({ description: 'URL do endpoint do webhook', example: 'https://webhook.zapfacil.com/hotmart/events' })
  endpoint: string;

  @ApiProperty({ description: 'Status do webhook', enum: ['success', 'error', 'pending'], example: 'success' })
  status: string;

  @ApiProperty({ description: 'Timestamp de quando o webhook foi disparado', example: '2024-01-21T14:30:00Z' })
  timestamp: string;

  @ApiProperty({ description: 'Tempo de resposta em milissegundos', example: 145, nullable: true })
  responseTime: number | null;

  @ApiProperty({ description: 'Informações do payload', type: RecentActivityPayloadDto })
  payload: RecentActivityPayloadDto;

  @ApiProperty({ description: 'Informações de resposta', type: RecentActivityResponseDto })
  response: RecentActivityResponseDto;

  @ApiProperty({ description: 'Número de tentativas', example: 0 })
  retryCount: number;
}

class PaymentMethodDto {
  @ApiProperty({ description: 'Tipo de método de pagamento', example: 'card' })
  type: string;

  @ApiProperty({ description: 'Últimos 4 dígitos', example: '1234' })
  last4: string;

  @ApiProperty({ description: 'Bandeira do cartão', example: 'Visa' })
  brand: string;
}

class BillingHistoryItemDto {
  @ApiProperty({ description: 'ID da cobrança', example: 'bill-001' })
  id: string;

  @ApiProperty({ description: 'Data da cobrança', example: '2024-01-21' })
  date: string;

  @ApiProperty({ description: 'Valor cobrado', example: 8990 })
  amount: number;

  @ApiProperty({ description: 'Status do pagamento', enum: ['paid', 'pending', 'failed'], example: 'paid' })
  status: 'paid' | 'pending' | 'failed';

  @ApiProperty({ description: 'URL da fatura', example: 'https://api.conectaplus.com/invoices/invoice-001.pdf' })
  invoiceUrl: string;
}

class BillingDto {
  @ApiProperty({ description: 'Próxima data de cobrança', example: '2024-02-21' })
  nextBillingDate: string;

  @ApiProperty({ description: 'Valor da cobrança', example: 8990 })
  amount: number;

  @ApiProperty({ description: 'Moeda', example: 'BRL' })
  currency: string;

  @ApiProperty({ description: 'Informações do método de pagamento', type: PaymentMethodDto })
  paymentMethod: PaymentMethodDto;

  @ApiProperty({ description: 'Histórico de cobranças', type: [BillingHistoryItemDto] })
  billingHistory: BillingHistoryItemDto[];
}

export class SubscriptionInfoResponseDto {
  @ApiProperty({ description: 'Nome do plano', example: 'Ouro' })
  planName: string;

  @ApiProperty({ description: 'Preço do plano', example: 8990 })
  planPrice: number;

  @ApiProperty({ description: 'Próxima data de cobrança', example: '2024-02-21' })
  nextBillingDate: string;

  @ApiProperty({ description: 'Status da assinatura', enum: ['active', 'trial', 'expired', 'cancelled'], example: 'active' })
  status: 'active' | 'trial' | 'expired' | 'cancelled';

  @ApiProperty({ description: 'Informações de cobrança', type: BillingDto, nullable: true })
  billing?: BillingDto;
}
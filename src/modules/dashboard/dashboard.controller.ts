import { Controller, Get, Logger, Query } from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ActiveUserExternalId } from 'src/common/decorators/active-user-id.decorator';
import { DashboardService } from './dashboard.service';
import {
  DashboardChartDataResponseDto,
  DashboardRecentActivitiesResponseDto,
  DashboardStatsResponseDto,
  SubscriptionInfoResponseDto
} from './dto/dashboard-responses.dto';

@ApiTags('Dashboard')
@Controller('dashboard')
export class DashboardController {
  private logger = new Logger(DashboardController.name)

  constructor(private readonly dashboardService: DashboardService) {}

  @Get()
  @ApiOperation({ summary: 'Buscar dados do dashboard do usuário ativo' })
  @ApiResponse({ status: 200, description: 'Dados do dashboard retornados com sucesso.' })
  @ApiResponse({ status: 404, description: 'Usuário não encontrado.' })
  async getDashboardData(@ActiveUserExternalId() externalId: string) {
    try {
      return this.dashboardService.getDashboardData(externalId)
    } catch (error) {
      this.logger.error(error)
      throw error
    }
  }

  @Get('stats')
  @ApiOperation({ summary: 'Estatísticas do dashboard' })
  @ApiResponse({ 
    status: 200, 
    description: 'Estatísticas retornadas com sucesso.',
    type: DashboardStatsResponseDto
  })
  @ApiQuery({ name: 'period', required: false, enum: ['today', 'week', 'month', 'year'], description: 'Período para análise' })
  @ApiQuery({ name: 'includeComparison', required: false, type: Boolean, description: 'Incluir comparação com período anterior' })
  async getStats(
    @ActiveUserExternalId() externalId: string,
    @Query('period') period?: 'today' | 'week' | 'month' | 'year',
    @Query('includeComparison') includeComparison?: boolean
  ): Promise<DashboardStatsResponseDto> {
    try {
      return this.dashboardService.getStats(externalId, period || 'month', includeComparison || false);
    } catch (error) {
      this.logger.error(error);
      throw error;
    }
  }

  @Get('chart-data')
  @ApiOperation({ summary: 'Dados para gráficos do dashboard' })
  @ApiResponse({ 
    status: 200, 
    description: 'Dados do gráfico retornados com sucesso.',
    type: DashboardChartDataResponseDto
  })
  @ApiQuery({ name: 'period', required: false, enum: ['day', 'week', 'month', 'year'], description: 'Período dos dados' })
  @ApiQuery({ name: 'granularity', required: false, enum: ['hour', 'day', 'week', 'month'], description: 'Granularidade dos dados' })
  async getChartData(
    @ActiveUserExternalId() externalId: string,
    @Query('period') period?: 'day' | 'week' | 'month' | 'year',
    @Query('granularity') granularity?: 'hour' | 'day' | 'week' | 'month'
  ): Promise<DashboardChartDataResponseDto> {
    try {
      return this.dashboardService.getChartData(externalId, period || 'week', granularity || 'day');
    } catch (error) {
      this.logger.error(error);
      throw error;
    }
  }

  @Get('recent-activities')
  @ApiOperation({ summary: 'Atividades recentes de webhooks' })
  @ApiResponse({ 
    status: 200, 
    description: 'Atividades retornadas com sucesso.',
    type: [DashboardRecentActivitiesResponseDto]
  })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Número máximo de atividades' })
  @ApiQuery({ name: 'status', required: false, enum: ['success', 'error', 'pending'], description: 'Filtrar por status' })
  async getRecentActivities(
    @ActiveUserExternalId() externalId: string,
    @Query('limit') limit?: number,
    @Query('status') status?: 'success' | 'error' | 'pending'
  ): Promise<DashboardRecentActivitiesResponseDto[]> {
    try {
      return this.dashboardService.getRecentActivities(externalId, limit || 10, status);
    } catch (error) {
      this.logger.error(error);
      throw error;
    }
  }

  @Get('subscription-info')
  @ApiOperation({ summary: 'Informações da assinatura' })
  @ApiResponse({ 
    status: 200, 
    description: 'Informações da assinatura retornadas com sucesso.',
    type: SubscriptionInfoResponseDto
  })
  @ApiQuery({ name: 'includeBillingHistory', required: false, type: Boolean, description: 'Incluir histórico de cobrança' })
  async getSubscriptionInfo(
    @ActiveUserExternalId() externalId: string,
    @Query('includeBillingHistory') includeBillingHistory?: boolean
  ): Promise<SubscriptionInfoResponseDto> {
    try {
      return this.dashboardService.getSubscriptionInfo(externalId, includeBillingHistory || false);
    } catch (error) {
      this.logger.error(error);
      throw error;
    }
  }
} 
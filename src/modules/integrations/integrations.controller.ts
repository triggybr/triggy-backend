import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Post, Put, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery, ApiParam } from '@nestjs/swagger';
import { ActiveUserExternalId } from 'src/common/decorators/active-user-id.decorator';
import { CreateIntegrationDto } from './dto/create-integration.dto';
import { FindAllUserIntegrationsQueryDto } from './dto/find-all-user-integrations';
import { UpdateIntegrationDto } from './dto/update-integration.dto';
import { IntegrationsService } from './integrations.service';
import { Logger } from '@nestjs/common';
import {
  IntegrationsResponseDto,
  IntegrationDto,
  AvailableIntegrationsResponseDto,
  DeleteIntegrationResponseDto
} from './dto/integrations-responses.dto';

@ApiTags('Integrations')
@Controller('integrations')
export class IntegrationsController {
  private logger = new Logger(IntegrationsController.name)

  constructor(private readonly integrationsService: IntegrationsService) { }

  @Get()
  @ApiOperation({ summary: 'Buscar integrações do usuário' })
  @ApiResponse({ status: 200, description: 'Lista de integrações retornada com sucesso.', type: IntegrationsResponseDto })
  @ApiQuery({ name: 'status', required: false, enum: ['active', 'inactive'], description: 'Filtrar por status da integração' })
  @ApiQuery({ name: 'source', required: false, enum: ['hotmart', 'kiwify', 'lastlink'], description: 'Filtrar por plataforma de origem' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Número máximo de resultados' })
  @ApiQuery({ name: 'offset', required: false, type: Number, description: 'Número de registros para pular' })
  async findIntegrations(
    @ActiveUserExternalId() externalId: string,
    @Query('status') status?: 'active' | 'inactive',
    @Query('source') source?: 'hotmart' | 'kiwify' | 'lastlink',
    @Query('limit') limit?: number,
    @Query('offset') offset?: number
  ): Promise<IntegrationsResponseDto> {
    try {
      return this.integrationsService.findIntegrations(externalId, { status, source, limit: limit || 10, offset: offset || 0 });
    } catch (error) {
      this.logger.error(error);
      throw error;
    }
  }

  @Post()
  @ApiOperation({ summary: 'Criar nova integração' })
  @ApiResponse({ status: 201, description: 'Integração criada com sucesso.', type: IntegrationDto })
  @HttpCode(HttpStatus.CREATED)
  async createIntegration(@ActiveUserExternalId() externalId: string, @Body() dto: CreateIntegrationDto): Promise<IntegrationDto> {
    try {
      return this.integrationsService.createUserIntegration(externalId, dto);
    } catch (error) {
      this.logger.error(error);
      throw error;
    }
  }

  @Get('/:id/user')
  @ApiOperation({ summary: 'Buscar integração por ID' })
  @ApiParam({ name: 'id', description: 'ID da integração' })
  @ApiResponse({ status: 200, description: 'Integração encontrada com sucesso.', type: IntegrationDto })
  async findUserIntegrationById(@ActiveUserExternalId() externalId: string, @Param('id') id: string): Promise<IntegrationDto> {
    try {
      return this.integrationsService.findUserIntegrationById(externalId, id);
    } catch (error) {
      this.logger.error(error);
      throw error;
    }
  }

  @Get('user')
  @ApiOperation({ summary: 'Buscar todas as integrações do usuário atual' })
  @ApiResponse({ status: 200, description: 'Integrações do usuário retornadas com sucesso.', type: IntegrationsResponseDto })
  async findAllUserIntegrations(@ActiveUserExternalId() externalId: string, @Query() query: FindAllUserIntegrationsQueryDto): Promise<IntegrationsResponseDto> {
    try {
      return this.integrationsService.findAllUserIntegrations(externalId, query);
    } catch (error) {
      this.logger.error(error)
      throw error
    }
  }

  @Post('user')
  @ApiOperation({ summary: 'Criar nova integração para o usuário atual' })
  @ApiResponse({ status: 201, description: 'Integração criada com sucesso.', type: IntegrationDto })
  @ApiResponse({ status: 400, description: 'Dados de integração inválidos.' })
  @HttpCode(HttpStatus.CREATED)
  async createUserIntegration(@ActiveUserExternalId() externalId: string, @Body() dto: CreateIntegrationDto): Promise<IntegrationDto> {
    try {
      return this.integrationsService.createUserIntegration(externalId, dto);
    } catch (error) {
      this.logger.error(error)
      throw error
    }
  }

  @Get('available')
  @ApiOperation({ summary: 'Buscar todas as integrações disponíveis' })
  @ApiQuery({ name: 'source', required: false, description: 'Filtrar destinos disponíveis por plataforma de origem.' })
  @ApiResponse({ status: 200, description: 'Integrações disponíveis retornadas com sucesso.', type: AvailableIntegrationsResponseDto })
  async getAvailableIntegrations(@Query('source') source?: string): Promise<AvailableIntegrationsResponseDto> {
    try {
      return this.integrationsService.getAvailableIntegrations({ source });
    } catch (error) {
      this.logger.error(error)
      throw error
    }
  }

  @Put('/:id/user')
  @ApiOperation({ summary: 'Atualizar integração' })
  @ApiParam({ name: 'id', description: 'ID da integração' })
  @ApiResponse({ status: 200, description: 'Integração atualizada com sucesso.', type: IntegrationDto })
  async update(
    @ActiveUserExternalId() externalId: string,
    @Param('id') id: string,
    @Body() dto: UpdateIntegrationDto
  ): Promise<IntegrationDto> {
    try {
      return this.integrationsService.updateUserIntegration(externalId, id, dto);
    } catch (error) {
      this.logger.error(error);
      throw error;
    }
  }

  @Delete('/:id/user')
  @ApiOperation({ summary: 'Excluir integração' })
  @ApiParam({ name: 'id', description: 'ID da integração' })
  @ApiResponse({ status: 200, description: 'Integração excluída com sucesso.', type: DeleteIntegrationResponseDto })
  @ApiResponse({ status: 404, description: 'Integração não encontrada.' })
  async remove(@ActiveUserExternalId() externalId: string, @Param('id') id: string): Promise<DeleteIntegrationResponseDto> {
    try {
      return this.integrationsService.removeUserIntegration(externalId, id);
    } catch (error) {
      this.logger.error(error)
      throw error
    }
  }
} 
import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Post, Query } from '@nestjs/common';
import { ActiveUserExternalId } from 'src/common/decorators/active-user-id.decorator';
import { CreateIntegrationDto } from './dto/create-integration.dto';
import { FindAllUserIntegrationsQueryDto } from './dto/find-all-user-integrations';
import { IntegrationsService } from './integrations.service';
import { Logger } from '@nestjs/common';

@Controller('integrations')
export class IntegrationsController {
  private logger = new Logger(IntegrationsController.name)

  constructor(private readonly integrationsService: IntegrationsService) {}

  @Get('user')
  async findAllUserIntegrations(@ActiveUserExternalId() externalId: string, @Query() query: FindAllUserIntegrationsQueryDto) {
    try {
      return this.integrationsService.findAllUserIntegrations(externalId, query);
    } catch (error) {
      this.logger.error(error)
      throw error
    }
  }

  @Post('user')
  @HttpCode(HttpStatus.CREATED)
  async createUserIntegration(@ActiveUserExternalId() externalId: string, @Body() dto: CreateIntegrationDto) {
    try {
      return this.integrationsService.createUserIntegration(externalId, dto);
    } catch (error) {
      this.logger.error(error)
      throw error
    }
  }

  @Get('available')
  async getAvailableIntegrations(@Query('source') source?: string) {
    try {
      return this.integrationsService.getAvailableIntegrations({ source });
    } catch (error) {
      this.logger.error(error)
      throw error
    }
  }

  @Delete(':id')
  async remove(@ActiveUserExternalId() externalId: string, @Param('id') id: string) {
    try {
      return this.integrationsService.removeUserIntegration(externalId, id);
    } catch (error) {
      this.logger.error(error)
      throw error
    }
  }
} 
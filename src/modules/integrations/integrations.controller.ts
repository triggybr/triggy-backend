import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Post, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery, ApiParam } from '@nestjs/swagger';
import { ActiveUserExternalId } from 'src/common/decorators/active-user-id.decorator';
import { CreateIntegrationDto } from './dto/create-integration.dto';
import { FindAllUserIntegrationsQueryDto } from './dto/find-all-user-integrations';
import { IntegrationsService } from './integrations.service';
import { Logger } from '@nestjs/common';

@ApiTags('Integrations')
@Controller('integrations')
export class IntegrationsController {
  private logger = new Logger(IntegrationsController.name)

  constructor(private readonly integrationsService: IntegrationsService) {}

  @Get('user')
  @ApiOperation({ summary: 'Find all integrations for the current user' })
  @ApiResponse({ status: 200, description: 'User integrations retrieved successfully.' })
  async findAllUserIntegrations(@ActiveUserExternalId() externalId: string, @Query() query: FindAllUserIntegrationsQueryDto) {
    try {
      return this.integrationsService.findAllUserIntegrations(externalId, query);
    } catch (error) {
      this.logger.error(error)
      throw error
    }
  }

  @Post('user')
  @ApiOperation({ summary: 'Create a new integration for the current user' })
  @ApiResponse({ status: 201, description: 'Integration created successfully.' })
  @ApiResponse({ status: 400, description: 'Invalid integration data.' })
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
  @ApiOperation({ summary: 'Get all available integrations' })
  @ApiQuery({ name: 'source', required: false, description: 'Filter available destinations by source platform.' })
  @ApiResponse({ status: 200, description: 'Available integrations retrieved successfully.' })
  async getAvailableIntegrations(@Query('source') source?: string) {
    try {
      return this.integrationsService.getAvailableIntegrations({ source });
    } catch (error) {
      this.logger.error(error)
      throw error
    }
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Remove a user integration' })
  @ApiParam({ name: 'id', description: 'The ID of the integration to remove.' })
  @ApiResponse({ status: 200, description: 'Integration removed successfully.' })
  @ApiResponse({ status: 404, description: 'Integration not found.' })
  async remove(@ActiveUserExternalId() externalId: string, @Param('id') id: string) {
    try {
      return this.integrationsService.removeUserIntegration(externalId, id);
    } catch (error) {
      this.logger.error(error)
      throw error
    }
  }
} 
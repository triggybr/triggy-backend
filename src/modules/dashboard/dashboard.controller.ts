import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { DashboardService } from './dashboard.service';
import { ActiveUserExternalId } from 'src/common/decorators/active-user-id.decorator';
import { Logger } from '@nestjs/common';

@ApiTags('Dashboard')
@Controller('dashboard')
export class DashboardController {
  private logger = new Logger(DashboardController.name)

  constructor(private readonly dashboardService: DashboardService) {}

  @Get()
  @ApiOperation({ summary: 'Get dashboard data for the active user' })
  @ApiResponse({ status: 200, description: 'Dashboard data retrieved successfully.' })
  @ApiResponse({ status: 404, description: 'User not found.' })
  async getDashboardData(@ActiveUserExternalId() externalId: string) {
    try {
      return this.dashboardService.getDashboardData(externalId)
    } catch (error) {
      this.logger.error(error)
      throw error
    }
  }
} 
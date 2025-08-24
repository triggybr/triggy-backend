import { Controller, Get } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { ActiveUserExternalId } from 'src/common/decorators/active-user-id.decorator';
import { Logger } from '@nestjs/common';

@Controller('dashboard')
export class DashboardController {
  private logger = new Logger(DashboardController.name)

  constructor(private readonly dashboardService: DashboardService) {}

  @Get()
  async getDashboardData(@ActiveUserExternalId() externalId: string) {
    try {
      return this.dashboardService.getDashboardData(externalId)
    } catch (error) {
      this.logger.error(error)
      throw error
    }
  }
} 
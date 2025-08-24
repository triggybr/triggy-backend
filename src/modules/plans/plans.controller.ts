import { Controller, Get, Logger, Query } from '@nestjs/common';
import { PlansService } from './plans.service';
import { GetPlansQueryDto } from './dto/get-plans-query.dto';

@Controller('plans')
export class PlansController {
  private logger = new Logger(PlansController.name)

  constructor(private readonly plansService: PlansService) {}

  @Get()
  async getPlans(@Query() query: GetPlansQueryDto) {
    try {
      return this.plansService.getPlans(!!query.includeFeatures);
    } catch (error) {
      this.logger.error(error)
      throw error
    }
  }
} 
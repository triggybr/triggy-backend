import { Controller, Get, Logger, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { PlansService } from './plans.service';
import { GetPlansQueryDto } from './dto/get-plans-query.dto';
import { PlansResponseDto } from './dto/plans-response.dto';
import { Public } from 'src/common/decorators/public.decorator';

@ApiTags('Plans')
@Public()
@Controller('plans')
export class PlansController {
  private logger = new Logger(PlansController.name)

  constructor(private readonly plansService: PlansService) { }

  @Get()
  @ApiOperation({ summary: 'Buscar todos os planos disponíveis' })
  @ApiResponse({
    status: 200,
    description: 'Lista de planos retornada com sucesso.',
    type: PlansResponseDto
  })
  @ApiResponse({ status: 500, description: 'Erro interno do servidor.' })
  @ApiQuery({ name: 'includeFeatures', required: false, type: Boolean, description: 'Incluir lista detalhada de features' })
  async getPlans(@Query() query: GetPlansQueryDto): Promise<PlansResponseDto> {
    try {
      return this.plansService.getPlans(!!query.includeFeatures);
    } catch (error) {
      this.logger.error(error)
      throw error
    }
  }
}   
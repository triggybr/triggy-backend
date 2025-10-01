import { ApiProperty } from '@nestjs/swagger';

export class PlanDto {
  @ApiProperty({ example: 'prata' })
  id: string;

  @ApiProperty({ example: 'Prata' })
  name: string;

  @ApiProperty({ example: 4990 })
  price: number;

  @ApiProperty({ example: 4990, description: 'Valor do preço em centavos' })
  priceValue: number;

  @ApiProperty({ example: 'Award' })
  icon: string;

  @ApiProperty({ example: 'Ideal para pequenas empresas e startups' })
  description: string;

  @ApiProperty({ 
    example: ['Até 3 integrações', '1.000 webhooks por mês'],
    type: [String],
    required: false
  })
  features?: string[];

  @ApiProperty({ example: false })
  popular: boolean;
}

export class PlansResponseDto {
  @ApiProperty({ type: [PlanDto] })
  plans: PlanDto[];
}
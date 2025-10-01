import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class ApplyCouponDto {
  @ApiProperty({ description: 'Código do cupom a ser aplicado.', example: 'PROMO10' })
  @IsString()
  @IsNotEmpty()
  couponCode: string;

  @ApiProperty({ description: 'ID do plano para aplicar o cupom.' })
  @IsString()
  @IsNotEmpty()
  planId: string;
} 
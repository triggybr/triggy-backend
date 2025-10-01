import { ApiProperty } from '@nestjs/swagger';

export class CouponDto {
  @ApiProperty({ example: 'PRIMEIRA10' })
  code: string;

  @ApiProperty({ example: 10, description: 'Valor do desconto (porcentagem ou centavos dependendo do tipo)' })
  discount: number;

  @ApiProperty({ example: 'percentage', enum: ['percentage', 'fixed'] })
  type: string;

  @ApiProperty({ example: '10% de desconto no primeiro mês' })
  description: string;
}

export class ApplyCouponResponseDto {
  @ApiProperty({ example: true })
  valid: boolean;

  @ApiProperty({ type: CouponDto, required: false })
  coupon?: CouponDto;

  @ApiProperty({ example: 899, description: 'Valor do desconto em centavos' })
  discountAmount: number;

  @ApiProperty({ example: 8091, description: 'Preço final em centavos' })
  finalPrice: number;

  @ApiProperty({ example: null, required: false })
  error?: string;
}

export class ProcessPaymentResponseDto {
  @ApiProperty({ example: true })
  success: boolean;

  @ApiProperty({ example: 'sub_abc123def456', required: false })
  subscriptionId?: string;

  @ApiProperty({ example: 'txn_789xyz012', required: false })
  transactionId?: string;

  @ApiProperty({ example: 'Pagamento processado com sucesso! Sua assinatura foi ativada.' })
  message: string;

  @ApiProperty({ example: null, required: false })
  error?: string;
}
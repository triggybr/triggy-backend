import { ApiProperty } from '@nestjs/swagger';
import { Type } from "class-transformer";
import { IsString, ValidateNested } from "class-validator";

class PaymentDto {
  @ApiProperty({ description: 'ID do pagamento.', example: 'pay_123456' })
  @IsString()
  id: string;

  @ApiProperty({ description: 'ID da assinatura associada ao pagamento.', example: 'sub_123456' })
  @IsString()
  subscription: string;
}

export class ConfirmPaymentDto {
  @ApiProperty({ description: 'Tipo do evento.', example: 'PAYMENT_CONFIRMED' })
  @IsString()
  event: string;

  @ApiProperty({ description: 'Data de criação do evento.', example: '2025-09-04T14:32:21-03:00' })
  @IsString()
  dateCreated: string;

  @ApiProperty({ description: 'Detalhes do pagamento do webhook.' })
  @Type(() => PaymentDto)
  @ValidateNested()
  payment: PaymentDto;
}
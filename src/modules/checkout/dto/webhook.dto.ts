import { ApiProperty } from '@nestjs/swagger';
import { Type } from "class-transformer";
import { IsString, ValidateNested } from "class-validator";

class PaymentDto {
  @ApiProperty({ description: 'The payment ID.', example: 'pay_123456' })
  @IsString()
  id: string;

  @ApiProperty({ description: 'The subscription ID associated with the payment.', example: 'sub_123456' })
  @IsString()
  subscription: string;
}

export class ConfirmPaymentDto {
  @ApiProperty({ description: 'The type of event.', example: 'PAYMENT_CONFIRMED' })
  @IsString()
  event: string;

  @ApiProperty({ description: 'The date the event was created.', example: '2025-09-04T14:32:21-03:00' })
  @IsString()
  dateCreated: string;

  @ApiProperty({ description: 'The payment details from the webhook.' })
  @Type(() => PaymentDto)
  @ValidateNested()
  payment: PaymentDto;
}
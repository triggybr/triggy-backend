import { Type } from "class-transformer";
import { IsString, ValidateNested } from "class-validator";

class PaymentDto {
  @IsString()
  id: string;

  @IsString()
  subscription: string;
}

export class ConfirmPaymentDto {
  @IsString()
  event: string;

  @IsString()
  dateCreated: string;

  @Type(() => PaymentDto)
  @ValidateNested()
  payment: PaymentDto;
}
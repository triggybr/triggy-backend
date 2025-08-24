import { IsEmail, IsNotEmpty, IsNumber, IsNumberString, IsOptional, IsString, Matches, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

class CustomerDataDto {
  @IsString()
  name: string;

  @IsString()
  @IsNotEmpty()
  cpfCnpj: string;

  @IsEmail()
  email: string;

  @IsString()
  postalCode: string;

  @IsString()
  addressNumber: string;

  @IsString()
  phone: string;
} 

class PaymentDataDto {
  @IsString()
  @IsNotEmpty()
  cardName: string;

  @IsNumberString()
  cardNumber: string;

  @Matches(/^(0[1-9]|1[0-2])$/)
  expiryMonth: string;

  @Matches(/^20[2-9][0-9]$/)
  expiryYear: string;

  @Matches(/^[0-9]{3,4}$/)
  cvv: string;
} 

export class ProcessPaymentDto {
  @IsString()
  planId: string;

  @ValidateNested()
  @Type(() => CustomerDataDto)
  customerData: CustomerDataDto;

  @ValidateNested()
  @Type(() => PaymentDataDto)
  paymentData: PaymentDataDto;

  @IsOptional()
  @IsString()
  couponCode?: string | null;
}
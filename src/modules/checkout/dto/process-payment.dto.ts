import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsNumberString, IsOptional, IsString, Matches, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

class CustomerDataDto {
  @ApiProperty({ description: 'Customer\'s full name.', example: 'John Doe' })
  @IsString()
  name: string;

  @ApiProperty({ description: 'Customer\'s CPF or CNPJ.', example: '123.456.789-00' })
  @IsString()
  @IsNotEmpty()
  cpfCnpj: string;

  @ApiProperty({ description: 'Customer\'s email address.', example: 'john.doe@example.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ description: 'Customer\'s postal code.', example: '12345-678' })
  @IsString()
  postalCode: string;

  @ApiProperty({ description: 'Customer\'s address number.', example: '123' })
  @IsString()
  addressNumber: string;

  @ApiProperty({ description: 'Customer\'s phone number.', example: '11987654321' })
  @IsString()
  phone: string;
} 

class PaymentDataDto {
  @ApiProperty({ description: 'Name on the credit card.', example: 'John H Doe' })
  @IsString()
  @IsNotEmpty()
  cardName: string;

  @ApiProperty({ description: 'Credit card number.', example: '4111111111111111' })
  @IsNumberString()
  cardNumber: string;

  @ApiProperty({ description: 'Credit card expiration month (MM).', example: '12' })
  @Matches(/^(0[1-9]|1[0-2])$/)
  expiryMonth: string;

  @ApiProperty({ description: 'Credit card expiration year (YYYY).', example: '2028' })
  @Matches(/^20[2-9][0-9]$/)
  expiryYear: string;

  @ApiProperty({ description: 'Credit card CVV.', example: '123' })
  @Matches(/^[0-9]{3,4}$/)
  cvv: string;
} 

export class ProcessPaymentDto {
  @ApiProperty({ description: 'The ID of the plan being purchased.', example: 'plan_pro' })
  @IsString()
  planId: string;

  @ApiProperty({ description: 'Customer data for the transaction.' })
  @ValidateNested()
  @Type(() => CustomerDataDto)
  customerData: CustomerDataDto;

  @ApiProperty({ description: 'Payment data for the transaction.' })
  @ValidateNested()
  @Type(() => PaymentDataDto)
  paymentData: PaymentDataDto;

  @ApiProperty({ description: 'Optional coupon code for a discount.', example: 'PROMO10', required: false })
  @IsOptional()
  @IsString()
  couponCode?: string | null;
}
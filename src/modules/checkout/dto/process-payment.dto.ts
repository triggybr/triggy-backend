import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsNumberString, IsOptional, IsString, Matches, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

class CustomerDataDto {
  @ApiProperty({ description: 'Nome completo do cliente.', example: 'John Doe' })
  @IsString()
  name: string;

  @ApiProperty({ description: 'CPF ou CNPJ do cliente.', example: '123.456.789-00' })
  @IsString()
  @IsNotEmpty()
  cpfCnpj: string;

  @ApiProperty({ description: 'Endereço de e-mail do cliente.', example: 'john.doe@example.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ description: 'CEP do cliente.', example: '12345-678', required: false })
  @IsOptional()
  @IsString()
  postalCode: string = '30160040';

  @ApiProperty({ description: 'Número do endereço do cliente.', example: '123', required: false })
  @IsOptional()
  @IsString()
  addressNumber: string = '243';

  @ApiProperty({ description: 'Número de telefone do cliente.', example: '11987654321', required: false })
  @IsOptional()
  @IsString()
  phone: string = '08000090037';
} 

class PaymentDataDto {
  @ApiProperty({ description: 'Nome no cartão de crédito.', example: 'John H Doe' })
  @IsString()
  @IsNotEmpty()
  cardName: string;

  @ApiProperty({ description: 'Número do cartão de crédito.', example: '4111111111111111' })
  @IsNumberString()
  cardNumber: string;

  @ApiProperty({ description: 'Mês de vencimento do cartão (MM).', example: '12' })
  @Matches(/^(0[1-9]|1[0-2])$/)
  expiryMonth: string;

  @ApiProperty({ description: 'Ano de vencimento do cartão (AAAA).', example: '2028' })
  @Matches(/^20[2-9][0-9]$/)
  expiryYear: string;

  @ApiProperty({ description: 'CVV do cartão de crédito.', example: '123' })
  @Matches(/^[0-9]{3,4}$/)
  cvv: string;
} 

export class ProcessPaymentDto {
  @ApiProperty({ description: 'ID do plano sendo adquirido.', example: 'plan_pro' })
  @IsString()
  planId: string;

  @ApiProperty({ description: 'Dados do cliente para a transação.' })
  @ValidateNested()
  @Type(() => CustomerDataDto)
  customerData: CustomerDataDto;

  @ApiProperty({ description: 'Dados de pagamento para a transação.' })
  @ValidateNested()
  @Type(() => PaymentDataDto)
  paymentData: PaymentDataDto;

  @ApiProperty({ description: 'Código de cupom opcional para desconto.', example: 'PROMO10', required: false })
  @IsOptional()
  @IsString()
  couponCode?: string | null;
}
import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsEmail, IsNotEmpty, IsOptional, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

class EmailAddressDto {
  @ApiProperty({ description: 'Endereço de e-mail.', example: 'example@example.com' })
  @IsEmail()
  email_address: string;

  @ApiProperty({ description: 'Identificador único do endereço de e-mail.' })
  @IsString()
  id: string;
}

class UserDataDto {
  @ApiProperty({ description: 'Identificador único do usuário.' })
  @IsString()
  @IsNotEmpty()
  id: string;

  @ApiProperty({ description: 'Lista de endereços de e-mail associados ao usuário.', type: [EmailAddressDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => EmailAddressDto)
  email_addresses: EmailAddressDto[];

  @ApiProperty({ description: 'ID do endereço de e-mail principal do usuário.', required: false })
  @IsOptional()
  @IsString()
  primary_email_address_id?: string;
}

export class CreateUserWebhookDto {
  @ApiProperty({ description: 'Dados do usuário do webhook.' })
  @ValidateNested()
  @Type(() => UserDataDto)
  data: UserDataDto;

  @ApiProperty({ description: 'Tipo de evento do webhook.', example: 'user.created' })
  @IsString()
  type: string;
}
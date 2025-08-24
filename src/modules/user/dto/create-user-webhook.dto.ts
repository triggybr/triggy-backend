import { IsArray, IsEmail, IsNotEmpty, IsOptional, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

class EmailAddressDto {
  @IsEmail()
  email_address: string;

  @IsString()
  id: string;
}

class UserDataDto {
  @IsString()
  @IsNotEmpty()
  id: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => EmailAddressDto)
  email_addresses: EmailAddressDto[];

  @IsOptional()
  @IsString()
  primary_email_address_id?: string;
}

export class CreateUserWebhookDto {
  @ValidateNested()
  @Type(() => UserDataDto)
  data: UserDataDto;

  @IsString()
  type: string;
}
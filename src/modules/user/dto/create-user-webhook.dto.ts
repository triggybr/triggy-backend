import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsEmail, IsNotEmpty, IsOptional, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

class EmailAddressDto {
  @ApiProperty({ description: 'The email address.', example: 'example@example.com' })
  @IsEmail()
  email_address: string;

  @ApiProperty({ description: 'The unique identifier for the email address.' })
  @IsString()
  id: string;
}

class UserDataDto {
  @ApiProperty({ description: 'The unique identifier for the user.' })
  @IsString()
  @IsNotEmpty()
  id: string;

  @ApiProperty({ description: 'A list of email addresses associated with the user.', type: [EmailAddressDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => EmailAddressDto)
  email_addresses: EmailAddressDto[];

  @ApiProperty({ description: 'The ID of the primary email address for the user.', required: false })
  @IsOptional()
  @IsString()
  primary_email_address_id?: string;
}

export class CreateUserWebhookDto {
  @ApiProperty({ description: 'The user data from the webhook.' })
  @ValidateNested()
  @Type(() => UserDataDto)
  data: UserDataDto;

  @ApiProperty({ description: 'The type of event from the webhook.', example: 'user.created' })
  @IsString()
  type: string;
}
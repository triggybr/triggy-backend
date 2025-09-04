import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, IsUrl, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class SourceDto {
  @ApiProperty({ description: 'The platform of the source integration.', example: 'hotmart' })
  @IsString()
  @IsNotEmpty()
  platform: string;

  @ApiProperty({ description: 'The event that triggers the integration.', example: 'PURCHASE_APPROVED' })
  @IsString()
  @IsNotEmpty()
  event: string;

  @ApiProperty({ description: 'The name of the source platform.', example: 'Hotmart', required: false })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({ description: 'The color associated with the source platform.', example: '#f04e23', required: false })
  @IsOptional()
  @IsString()
  color?: string;

  @ApiProperty({ description: 'A description of the source event.', example: 'When a purchase is approved', required: false })
  @IsOptional()
  @IsString()
  eventDescription?: string | null;
}

export class DestinationDto {
  @ApiProperty({ description: 'The platform of the source integration.', example: 'hotmart' })
  @IsString()
  @IsNotEmpty()
  platform: string;

  @ApiProperty({ description: 'The action to be performed by the destination.', example: 'create_member' })
  @IsString()
  @IsNotEmpty()
  action: string;

  @ApiProperty({ description: 'The URL for the destination webhook.', example: 'https://webhook.site/12345', required: false })
  @IsOptional()
  @IsUrl()
  url?: string | null;

  @ApiProperty({ description: 'The API key for the destination service.', example: 'your-api-key', required: false })
  @IsOptional()
  @IsString()
  apiKey?: string | null;

  @ApiProperty({ description: 'The name of the destination platform.', example: 'Discord', required: false })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({ description: 'The color associated with the source platform.', example: '#f04e23', required: false })
  @IsOptional()
  @IsString()
  color?: string;

  @ApiProperty({ description: 'A description of the destination action.', example: 'Creates a new member', required: false })
  @IsOptional()
  @IsString()
  actionDescription?: string | null;
}

export class CreateIntegrationDto {
  @ApiProperty({ description: 'A custom name for the integration.', example: 'My Hotmart Integration', required: false })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({ description: 'The source of the integration trigger.' })
  @ValidateNested()
  @Type(() => SourceDto)
  source: SourceDto;

  @ApiProperty({ description: 'The destination where the action will be performed.' })
  @ValidateNested()
  @Type(() => DestinationDto)
  destination: DestinationDto;
} 
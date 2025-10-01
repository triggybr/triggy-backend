import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString, IsUrl } from 'class-validator';

export class UpdateIntegrationDto {
  @ApiProperty({ description: 'Nome da integração.', example: 'PURCHASE_APPROVED' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({ description: 'URL de destino da integração.', example: 'https://webhook.site/12345' })
  @IsOptional()
  @IsUrl()
  destinationUrl?: string;

  @ApiProperty({ description: 'Status da integração.', example: 'active' })
  @IsOptional()
  @IsEnum(['active', 'inactive'])
  status?: 'active' | 'inactive';
} 
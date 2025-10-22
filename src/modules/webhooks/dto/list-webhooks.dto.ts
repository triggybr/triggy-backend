import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsEnum, IsInt, IsOptional, IsString, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class ListWebhooksDto {
  @ApiProperty({ description: 'Número da página para paginação.', minimum: 1, default: 1, required: false })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page: number = 1;

  @ApiProperty({ description: 'Número máximo de webhooks a retornar por página.', minimum: 1, default: 10, required: false })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit: number = 10;

  @ApiProperty({ description: 'Filtrar webhooks por ID de integração específica.', required: false })
  @IsOptional()
  @IsString()
  integrationId?: string;

  @ApiProperty({ description: 'Filtrar webhooks por status.', enum: ['success', 'error'], required: false })
  @IsOptional()
  @IsEnum(['success', 'error'])
  status?: 'success' | 'error';
} 
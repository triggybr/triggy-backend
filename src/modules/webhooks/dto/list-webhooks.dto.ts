import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsEnum, IsInt, IsOptional, IsString, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class ListWebhooksDto {
  @ApiProperty({ description: 'The page number for pagination.', minimum: 1, default: 1, required: false })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page: number = 1;

  @ApiProperty({ description: 'The maximum number of webhooks to return per page.', minimum: 1, default: 10, required: false })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit: number = 10;

  @ApiProperty({ description: 'Filter webhooks by a specific integration ID.', required: false })
  @IsOptional()
  @IsString()
  integrationId?: string;

  @ApiProperty({ description: 'Filter webhooks by status.', enum: ['SUCCESS', 'ERROR'], required: false })
  @IsOptional()
  @IsEnum(['SUCCESS', 'ERROR'])
  status?: 'SUCCESS' | 'ERROR';

  @ApiProperty({ description: 'The start date to filter webhooks (ISO 8601 format).', required: false })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiProperty({ description: 'The end date to filter webhooks (ISO 8601 format).', required: false })
  @IsOptional()
  @IsDateString()
  endDate?: string;
} 
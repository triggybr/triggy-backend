import { IsOptional, IsInt, IsEnum, IsDateString, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class BillingHistoryQueryDto {
    @ApiPropertyOptional({
        description: 'Número máximo de faturas por página',
        minimum: 1,
        maximum: 100,
        default: 10,
    })
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    @Max(100)
    limit?: number = 10;

    @ApiPropertyOptional({
        description: 'Número de registros para pular (paginação)',
        minimum: 0,
        default: 0,
    })
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(0)
    offset?: number = 0;

    @ApiPropertyOptional({
        description: 'Filtrar por status da fatura',
        enum: ['all', 'paid', 'pending', 'failed', 'cancelled'],
        default: 'all',
    })
    @IsOptional()
    @IsEnum(['all', 'paid', 'pending', 'failed', 'cancelled'])
    status?: string = 'all';

    @ApiPropertyOptional({
        description: 'Data de início para filtro (formato YYYY-MM-DD)',
        example: '2023-01-01',
    })
    @IsOptional()
    @IsDateString()
    startDate?: string;

    @ApiPropertyOptional({
        description: 'Data de fim para filtro (formato YYYY-MM-DD)',
        example: '2024-01-31',
    })
    @IsOptional()
    @IsDateString()
    endDate?: string;
}


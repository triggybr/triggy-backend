import { IsOptional, IsBoolean } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpgradeOptionsQueryDto {
    @ApiPropertyOptional({
        description: 'Incluir comparação detalhada de features',
        default: false,
    })
    @IsOptional()
    @Type(() => Boolean)
    @IsBoolean()
    includeFeatureComparison?: boolean = false;
}


import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class FindAllUserIntegrationsQueryDto {
  @ApiProperty({ description: 'Filter integrations by status.', enum: ['active', 'inactive'], required: false })
  @IsOptional()
  @IsEnum(['active', 'inactive'])
  status?: 'active' | 'inactive';

  @ApiProperty({ description: 'Filter integrations by source platform.', example: 'hotmart', required: false })
  @IsOptional()
  @IsString()
  source?: string;

  @ApiProperty({ description: 'The maximum number of integrations to return.', minimum: 1, maximum: 100, default: 10, required: false })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit: number = 10;

  @ApiProperty({ description: 'The number of integrations to skip.', minimum: 0, default: 0, required: false })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  offset: number = 0;
}

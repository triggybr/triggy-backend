import { IsBoolean, IsOptional } from 'class-validator';

export class GetPlansQueryDto {
  @IsOptional()
  @IsBoolean()
  includeFeatures?: boolean = true;
} 
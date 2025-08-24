import { IsNotEmpty, IsOptional, IsString, IsUrl, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class SourceDto {
  @IsString()
  @IsNotEmpty()
  platform: string;

  @IsString()
  @IsNotEmpty()
  event: string;

  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  color?: string;

  @IsOptional()
  @IsString()
  eventDescription?: string | null;
}

export class DestinationDto {
  @IsString()
  @IsNotEmpty()
  platform: string;

  @IsString()
  @IsNotEmpty()
  action: string;

  @IsOptional()
  @IsUrl()
  url?: string | null;

  @IsOptional()
  @IsString()
  apiKey?: string | null;

  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  color?: string;

  @IsOptional()
  @IsString()
  actionDescription?: string | null;
}

export class CreateIntegrationDto {
  @IsOptional()
  @IsString()
  name?: string;

  @ValidateNested()
  @Type(() => SourceDto)
  source: SourceDto;

  @ValidateNested()
  @Type(() => DestinationDto)
  destination: DestinationDto;
} 
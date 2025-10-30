import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, IsUrl, ValidateNested, IsObject } from 'class-validator';
import { Type } from 'class-transformer';

export class SourceDto {
  @ApiProperty({ description: 'Plataforma da integração de origem.', example: 'hotmart' })
  @IsString()
  @IsNotEmpty()
  platform: string;

  @ApiProperty({ description: 'Evento que dispara a integração.', example: 'PURCHASE_APPROVED' })
  @IsString()
  @IsNotEmpty()
  event: string;
}

class AdditionalFields {
  @ApiProperty({ description: 'Nome do campo adicional.', example: 'channel_id' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ description: 'Valor do campo adicional.', example: '1234567890' })
  @IsString()
  @IsNotEmpty()
  value: string;
}

export class DestinationDto {
  @ApiProperty({ description: 'Plataforma de destino da integração.', example: 'discord' })
  @IsString()
  @IsNotEmpty()
  platform: string;

  @ApiProperty({ description: 'Ação a ser executada no destino.', example: 'create_member' })
  @IsString()
  @IsNotEmpty()
  action: string;

  @ApiProperty({ description: 'Campos adicionais necessários para a ação.', type: [AdditionalFields], required: false })
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => AdditionalFields)
  additionalFields?: AdditionalFields[];
}

export class CreateIntegrationDto {
  @ApiProperty({ description: 'Nome personalizado para a integração.', example: 'Minha Integração Hotmart', required: false })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({ description: 'Origem do gatilho da integração.' })
  @ValidateNested()
  @Type(() => SourceDto)
  source: SourceDto;

  @ApiProperty({ description: 'Destino onde a ação será executada.' })
  @ValidateNested()
  @Type(() => DestinationDto)
  destination: DestinationDto;

  @ApiProperty({
    description: 'Mapeamento de Product IDs entre origem e destino (Order Bump).',
    example: { "prod_hotmart_123": "prod_astron_456", "prod_hotmart_789": "prod_astron_012" },
    required: false
  })
  @IsOptional()
  @IsObject()
  orderBump?: Record<string, string>;
} 
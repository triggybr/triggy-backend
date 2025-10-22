import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, IsUrl, ValidateNested } from 'class-validator';
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

  @ApiProperty({ description: 'Nome da plataforma de origem.', example: 'Hotmart', required: false })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({ description: 'Descrição do evento de origem.', example: 'Quando uma compra é aprovada', required: false })
  @IsOptional()
  @IsString()
  eventDescription?: string | null;
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

  @ApiProperty({ description: 'Nome da plataforma de destino.', example: 'Discord', required: false })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({ description: 'Descrição da ação de destino.', example: 'Cria um novo membro', required: false })
  @IsOptional()
  @IsString()
  actionDescription?: string | null;
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
} 
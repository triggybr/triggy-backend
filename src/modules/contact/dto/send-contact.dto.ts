import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsEnum, IsNotEmpty, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

export enum AssuntoEnum {
  VENDAS = 'vendas',
  SUPORTE = 'suporte',
  INTEGRACAO = 'integracao',
  PARCERIA = 'parceria',
  OUTRO = 'outro',
}

export class SendContactDto {
  @ApiProperty({
    description: 'Nome completo do remetente',
    example: 'João Silva',
    minLength: 2,
    maxLength: 100,
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(100)
  nome: string;

  @ApiProperty({
    description: 'Email do remetente',
    example: 'joao@example.com',
    minLength: 5,
    maxLength: 100,
  })
  @IsEmail()
  @IsNotEmpty()
  @MinLength(5)
  @MaxLength(100)
  email: string;

  @ApiProperty({
    description: 'Nome da empresa (opcional)',
    example: 'Empresa XYZ',
    maxLength: 100,
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  empresa?: string;

  @ApiProperty({
    description: 'Assunto da mensagem',
    example: 'vendas',
    enum: AssuntoEnum,
  })
  @IsEnum(AssuntoEnum)
  @IsNotEmpty()
  assunto: AssuntoEnum;

  @ApiProperty({
    description: 'Mensagem do contato',
    example: 'Gostaria de mais informações sobre os planos disponíveis.',
    minLength: 10,
    maxLength: 1000,
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(10)
  @MaxLength(1000)
  mensagem: string;
}


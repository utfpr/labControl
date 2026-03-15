import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsUUID, IsOptional, IsEnum } from 'class-validator';
import { EquipamentoStatus } from '../../../common/enums'; // Ajuste o caminho se necessário

export class CriarEquipamentoDto {
  @ApiProperty({ example: '123456-UTFPR', description: 'Número de patrimônio do equipamento' })
  @IsString()
  @IsNotEmpty()
  patrimonio: string;

  @ApiProperty({ example: 'Osciloscópio Digital', description: 'Nome do equipamento' })
  @IsString()
  @IsNotEmpty()
  nome: string;

  @ApiPropertyOptional({ example: 'Tektronix', description: 'Marca ou fabricante' })
  @IsString()
  @IsOptional()
  marca?: string;

  @ApiPropertyOptional({ example: '100 MHz, 2 Canais', description: 'Especificações técnicas' })
  @IsString()
  @IsOptional()
  especificacao?: string;

  @ApiPropertyOptional({ example: 'https://link-para-o-pdf.com/pop.pdf', description: 'Link para o Procedimento Operacional Padrão' })
  @IsString()
  @IsOptional()
  arquivoPop?: string;

  @ApiProperty({ 
    enum: EquipamentoStatus, 
    example: EquipamentoStatus.NORMAL, 
    description: 'Status de operação do equipamento' 
  })
  @IsEnum(EquipamentoStatus)
  @IsNotEmpty()
  status: EquipamentoStatus;

  @ApiProperty({ example: 'uuid-do-curso', description: 'ID do curso responsável pelo equipamento' })
  @IsUUID()
  @IsNotEmpty()
  cursoId: string;

  @ApiProperty({ example: 'uuid-do-local', description: 'ID do local onde o equipamento está' })
  @IsUUID()
  @IsNotEmpty()
  localId: string;
}
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsUUID, IsOptional, IsEnum, IsDateString } from 'class-validator';
import { Status } from '../../../common/enums';

export class CriarReservaEquipamentoDto {
  @ApiProperty({ example: '2026-04-12T14:00:00Z', description: 'Data de início' })
  @IsDateString()
  @IsNotEmpty()
  dataInicio: string;

  @ApiProperty({ example: '2026-04-15T18:00:00Z', description: 'Data de término (devolução)' })
  @IsDateString()
  @IsNotEmpty()
  dataFim: string;

  @ApiPropertyOptional({ example: 'Uso no projeto de mestrado', description: 'Motivo do empréstimo' })
  @IsString()
  @IsOptional()
  motivo?: string;

  @ApiPropertyOptional({ enum: Status, example: Status.PENDENTE })
  @IsEnum(Status)
  @IsOptional()
  status?: Status;

  @ApiPropertyOptional({ example: 'uuid-do-usuario', description: 'ID do solicitante' })
  @IsUUID()
  @IsOptional()
  solicitanteId?: string;

  @ApiProperty({ example: 'uuid-do-equipamento', description: 'ID do equipamento' })
  @IsUUID()
  @IsNotEmpty()
  equipamentoId: string;
}
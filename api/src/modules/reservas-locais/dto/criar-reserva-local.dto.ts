import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsUUID, IsOptional, IsEnum, IsDateString } from 'class-validator';
import { Status } from '../../../common/enums'; // Ajuste o nome/caminho do seu Enum de status

export class CriarReservaLocalDto {
  @ApiProperty({ example: '2026-04-10T08:00:00Z', description: 'Data e hora de início da reserva' })
  @IsDateString()
  @IsNotEmpty()
  dataInicio: string;

  @ApiProperty({ example: '2026-04-10T12:00:00Z', description: 'Data e hora de término da reserva' })
  @IsDateString()
  @IsNotEmpty()
  dataFim: string;

  @ApiPropertyOptional({ example: 'Aula prática extra de Redes', description: 'Motivo da reserva' })
  @IsString()
  @IsOptional()
  motivo?: string;

  @ApiProperty({ enum: Status, example: Status.PENDENTE, description: 'Status atual da reserva' })
  @IsEnum(Status)
  @IsNotEmpty()
  status: Status;

  @ApiProperty({ example: 'uuid-do-usuario', description: 'ID do usuário solicitante' })
  @IsUUID()
  @IsNotEmpty()
  solicitanteId: string;

  @ApiProperty({ example: 'uuid-do-local', description: 'ID do laboratório/local reservado' })
  @IsUUID()
  @IsNotEmpty()
  localId: string;
}
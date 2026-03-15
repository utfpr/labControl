import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsUUID, IsInt, Min, Max } from 'class-validator';

export class CriarAulaDto {
  @ApiProperty({ example: '2026-03-01', description: 'Data de início das aulas (YYYY-MM-DD)' })
  @IsString()
  @IsNotEmpty()
  dataInicio: string;

  @ApiProperty({ example: '2026-07-15', description: 'Data de fim das aulas (YYYY-MM-DD)' })
  @IsString()
  @IsNotEmpty()
  dataFim: string;

  @ApiProperty({ example: 1, description: 'Dia da semana (1=Segunda, 7=Domingo)' })
  @IsInt()
  @Min(1)
  @Max(7)
  diaSemana: number;

  @ApiProperty({ example: '08:20:00', description: 'Hora de início' })
  @IsString()
  @IsNotEmpty()
  horaInicio: string;

  @ApiProperty({ example: '10:00:00', description: 'Hora de término' })
  @IsString()
  @IsNotEmpty()
  horaFim: string;

  @ApiProperty({ example: 'uuid-da-disciplina', description: 'ID da disciplina' })
  @IsUUID()
  @IsNotEmpty()
  disciplinaId: string;

  @ApiProperty({ example: 'uuid-do-local', description: 'ID do local (laboratório)' })
  @IsUUID()
  @IsNotEmpty()
  localId: string;

  @ApiProperty({ example: 'uuid-do-professor', description: 'ID do usuário professor' })
  @IsUUID()
  @IsNotEmpty()
  professorId: string;
}
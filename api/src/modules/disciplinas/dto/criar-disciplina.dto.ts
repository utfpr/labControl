import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsUUID } from 'class-validator';

export class CriarDisciplinaDto {
  @ApiProperty({ example: 'Estrutura de Dados', description: 'Nome da disciplina' })
  @IsString()
  @IsNotEmpty()
  nome: string;

  @ApiProperty({ example: 'uuid-do-usuario-responsavel', description: 'ID do usuário responsável pela disciplina' })
  @IsUUID()
  @IsNotEmpty()
  responsavelId: string;
}
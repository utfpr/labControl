import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';

export class CriarCursoDto {
  @ApiProperty({ example: 'Sistemas de Informação', description: 'Nome do curso' })
  @IsString()
  @IsNotEmpty()
  nome: string;

  @ApiProperty({ example: 'Prof. Dr. Alan Turing', description: 'Nome do coordenador' })
  @IsString()
  @IsNotEmpty()
  coordenador: string;
}
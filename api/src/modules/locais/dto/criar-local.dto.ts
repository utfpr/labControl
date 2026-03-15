import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsUUID, IsOptional } from 'class-validator';

export class CriarLocalDto {
  @ApiProperty({ example: 'Laboratório de Redes', description: 'Nome do local' })
  @IsString()
  @IsNotEmpty()
  nome: string;

  @ApiPropertyOptional({ example: 'Laboratório equipado com 30 PCs e switches Cisco', description: 'Descrição detalhada do local' })
  @IsString()
  @IsOptional()
  descricao?: string;

  @ApiProperty({ example: 'uuid-do-curso-aqui', description: 'ID do curso ao qual o local pertence' })
  @IsUUID()
  @IsNotEmpty()
  cursoId: string;

  @ApiProperty({ example: 'uuid-do-usuario-supervisor-aqui', description: 'ID do usuário responsável pelo local' })
  @IsUUID()
  @IsNotEmpty()
  supervisorId: string;
}
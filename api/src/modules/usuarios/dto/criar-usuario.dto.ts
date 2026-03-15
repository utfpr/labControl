import { ApiProperty } from '@nestjs/swagger';
// 👇 Adicionamos o IsUUID aqui nesta linha:
import { IsString, IsEmail, IsNotEmpty, IsEnum, IsUUID } from 'class-validator';
import { UserRole } from '../../../common/enums';

export class CriarUsuarioDto {
  @ApiProperty({ example: 'Ivanilton Polato', description: 'Nome do usuário' })
  @IsString()
  @IsNotEmpty()
  nome: string;

  @ApiProperty({ example: 'ipolato@email.com', description: 'E-mail institucional' })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ example: '1234567', description: 'Registro Acadêmico numérico' })
  @IsString()
  @IsNotEmpty()
  ra: string;

  @ApiProperty({ 
    enum: UserRole, 
    example: UserRole.ADMIN, 
    description: 'Papel de permissão do usuário' 
  })
  @IsEnum(UserRole)
  @IsNotEmpty()
  role: UserRole;

  @ApiProperty({ example: 'uuid-do-curso-aqui', description: 'ID do curso ao qual o usuário pertence' })
  @IsUUID() // Agora o TypeScript sabe o que é isso!
  @IsNotEmpty()
  cursoId: string;
}
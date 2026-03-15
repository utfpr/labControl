import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsuariosController } from './usuarios.controller';
import { UsuariosService } from './usuarios.service';
import { Usuario } from '../entities/usuario.entity'; // Verifique se o caminho bate com a sua estrutura

@Module({
  imports: [TypeOrmModule.forFeature([Usuario])], // <-- Isso libera o Repositório!
  controllers: [UsuariosController],
  providers: [UsuariosService],
})
export class UsuariosModule {}
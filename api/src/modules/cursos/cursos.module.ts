import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CursosController } from './cursos.controller';
import { CursosService } from './cursos.service';
import { Curso } from '../entities/curso.entity'; 

@Module({
  imports: [TypeOrmModule.forFeature([Curso])], // Libera o Repositório do TypeORM para os Cursos
  controllers: [CursosController],
  providers: [CursosService],
})
export class CursosModule {}
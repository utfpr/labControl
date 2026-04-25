import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SeedService } from './seed.service';
import { Usuario } from '../modules/entities/usuario.entity';
import { Curso } from '../modules/entities/curso.entity';
import { Local } from '../modules/entities/local.entity';
import { Equipamento } from '../modules/entities/equipamento.entity';
import { Disciplina } from '../modules/entities/disciplina.entity';
import { Aula } from '../modules/entities/aula.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Usuario, Curso, Local, Equipamento, Disciplina, Aula])],
  providers: [SeedService],
})
export class SeedModule {}
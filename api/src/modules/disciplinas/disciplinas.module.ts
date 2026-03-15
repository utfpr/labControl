import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DisciplinasController } from './disciplinas.controller';
import { DisciplinasService } from './disciplinas.service';
import { Disciplina } from '../entities/disciplina.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Disciplina])],
  controllers: [DisciplinasController],
  providers: [DisciplinasService],
})
export class DisciplinasModule {}
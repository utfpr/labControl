import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AulasController } from './aulas.controller';
import { AulasService } from './aulas.service';
import { Aula } from '../entities/aula.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Aula])],
  controllers: [AulasController],
  providers: [AulasService],
})
export class AulasModule {}
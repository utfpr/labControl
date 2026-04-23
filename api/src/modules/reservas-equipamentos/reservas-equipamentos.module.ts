import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReservasEquipamentosController } from './reservas-equipamentos.controller';
import { ReservasEquipamentosService } from './reservas-equipamentos.service';
import { ReservaEquipamento } from '../entities/reserva.equipamento.entity';
import { BookingConflictService } from '../shared/booking-conflict.service';
import { ReservaLocal } from '../entities/reserva.local.entity';
import { Aula } from '../entities/aula.entity';
import { Local } from '../entities/local.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ReservaEquipamento, ReservaLocal, Aula, Local])],
  controllers: [ReservasEquipamentosController],
  providers: [ReservasEquipamentosService, BookingConflictService],
  exports: [BookingConflictService],
})
export class ReservasEquipamentosModule {}
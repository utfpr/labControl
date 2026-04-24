import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReservasEquipamentosController } from './reservas-equipamentos.controller';
import { ReservasEquipamentosService } from './reservas-equipamentos.service';
import { ReservaEquipamento } from '../entities/reserva.equipamento.entity';
import { ConflitoReservasService } from '../shared/conflito-reservas.service';
import { ReservaLocal } from '../entities/reserva.local.entity';
import { Aula } from '../entities/aula.entity';
import { Local } from '../entities/local.entity';
import { Equipamento } from '../entities/equipamento.entity';
import { BookingHistory } from '../entities/booking-history.entity';
import { HistoricoReservasService } from '../shared/historico-reservas.service';

@Module({
  imports: [TypeOrmModule.forFeature([ReservaEquipamento, ReservaLocal, Aula, Local, Equipamento, BookingHistory])],
  controllers: [ReservasEquipamentosController],
  providers: [ReservasEquipamentosService, ConflitoReservasService, HistoricoReservasService],
  exports: [ConflitoReservasService],
})
export class ReservasEquipamentosModule {}
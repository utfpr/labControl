import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReservasLocaisController } from './reservas-locais.controller';
import { ReservasLocaisService } from './reservas-locais.service';
import { ReservaLocal } from '../entities/reserva.local.entity';
import { ConflitoReservasService } from '../shared/conflito-reservas.service';
import { ReservaEquipamento } from '../entities/reserva.equipamento.entity';
import { Aula } from '../entities/aula.entity';
import { Equipamento } from '../entities/equipamento.entity';
import { BookingHistory } from '../entities/booking-history.entity';
import { HistoricoReservasService } from '../shared/historico-reservas.service';

@Module({
  imports: [TypeOrmModule.forFeature([ReservaLocal, ReservaEquipamento, Aula, Equipamento, BookingHistory])],
  controllers: [ReservasLocaisController],
  providers: [ReservasLocaisService, ConflitoReservasService, HistoricoReservasService],
  exports: [ConflitoReservasService],
})
export class ReservasLocaisModule {}
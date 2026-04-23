import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReservasLocaisController } from './reservas-locais.controller';
import { ReservasLocaisService } from './reservas-locais.service';
import { ReservaLocal } from '../entities/reserva.local.entity';
import { BookingConflictService } from '../shared/booking-conflict.service';
import { ReservaEquipamento } from '../entities/reserva.equipamento.entity';
import { Aula } from '../entities/aula.entity';
import { Equipamento } from '../entities/equipamento.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ReservaLocal, ReservaEquipamento, Aula, Equipamento])],
  controllers: [ReservasLocaisController],
  providers: [ReservasLocaisService, BookingConflictService],
  exports: [BookingConflictService],
})
export class ReservasLocaisModule {}
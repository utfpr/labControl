import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReservasEquipamentosController } from './reservas-equipamentos.controller';
import { ReservasEquipamentosService } from './reservas-equipamentos.service';
import { ReservaEquipamento } from '../entities/reserva.equipamento.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ReservaEquipamento])],
  controllers: [ReservasEquipamentosController],
  providers: [ReservasEquipamentosService],
})
export class ReservasEquipamentosModule {}
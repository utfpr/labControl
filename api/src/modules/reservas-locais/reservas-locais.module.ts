import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReservasLocaisController } from './reservas-locais.controller';
import { ReservasLocaisService } from './reservas-locais.service';
import { ReservaLocal } from '../entities/reserva.local.entity'; // Caminho para sua entidade

@Module({
  imports: [TypeOrmModule.forFeature([ReservaLocal])],
  controllers: [ReservasLocaisController],
  providers: [ReservasLocaisService],
})
export class ReservasLocaisModule {}
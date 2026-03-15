import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EquipamentosController } from './equipamentos.controller';
import { EquipamentosService } from './equipamentos.service';
import { Equipamento } from '../entities/equipamento.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Equipamento])],
  controllers: [EquipamentosController],
  providers: [EquipamentosService],
})
export class EquipamentosModule {}
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ReservaEquipamento } from '../entities/reserva.equipamento.entity';

@Injectable()
export class ReservasEquipamentosService {
  constructor(
    @InjectRepository(ReservaEquipamento)
    private reservasEquipamentosRepository: Repository<ReservaEquipamento>,
  ) {}

  async criar(dados: any): Promise<ReservaEquipamento> {
    const novaReserva = this.reservasEquipamentosRepository.create({
      dataHoraInicio: dados.dataHoraInicio || dados.dataInicio,
      dataHoraFim: dados.dataHoraFim || dados.dataFim,
      motivo: dados.motivo,
      status: dados.status,
      solicitante: { id: dados.solicitanteId },
      equipamento: { id: dados.equipamentoId },
    } as unknown as ReservaEquipamento); // 👈 A mágica que resolve o erro está aqui

    return await this.reservasEquipamentosRepository.save(novaReserva);
  }

  async listarTodas(): Promise<ReservaEquipamento[]> {
    return await this.reservasEquipamentosRepository.find({
      relations: ['solicitante', 'equipamento'],
    });
  }
}
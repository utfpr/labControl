import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ReservaLocal } from '../entities/reserva.local.entity';

@Injectable()
export class ReservasLocaisService {
  constructor(
    @InjectRepository(ReservaLocal)
    private reservasLocaisRepository: Repository<ReservaLocal>,
  ) {}

  async criar(dados: any): Promise<ReservaLocal> {
    const novaReserva = this.reservasLocaisRepository.create({
      dataHoraInicio: dados.dataHoraInicio || dados.dataInicio,
      dataHoraFim: dados.dataHoraFim || dados.dataFim,
      motivo: dados.motivo,
      status: dados.status,
      solicitante: { id: dados.solicitanteId },
      local: { id: dados.localId },
    } as unknown as ReservaLocal); // 👈 A mágica que resolve o erro está aqui

    return await this.reservasLocaisRepository.save(novaReserva);
  }

  async listarTodas(): Promise<ReservaLocal[]> {
    return await this.reservasLocaisRepository.find({
      relations: ['solicitante', 'local'],
    });
  }
}
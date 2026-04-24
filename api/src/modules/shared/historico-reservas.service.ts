import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BookingHistory } from '../entities/booking-history.entity';
import { ReservaTipo, Status } from '../../common/enums';
import { ReservaLocal } from '../entities/reserva.local.entity';
import { ReservaEquipamento } from '../entities/reserva.equipamento.entity';

@Injectable()
export class HistoricoReservasService {
  constructor(
    @InjectRepository(BookingHistory)
    private historicoRepository: Repository<BookingHistory>,
  ) { }

  async criarRegistro(
    reservaId: string,
    tipoReserva: ReservaTipo,
    usuarioId: string,
    statusAntigo: Status,
    statusNovo: Status,
    observacao?: string,
  ): Promise<BookingHistory> {
    const registro = this.historicoRepository.create({
      reservaId,
      tipoReserva,
      usuarioId,
      statusAntigo,
      statusNovo,
      observacao: observacao || null,
    });

    return await this.historicoRepository.save(registro);
  }

  async getHistoricoPorReserva(reservaId: string, tipoReserva: ReservaTipo): Promise<BookingHistory[]> {
    return await this.historicoRepository.find({
      where: {
        reservaId,
        tipoReserva,
      },
      relations: ['usuario'],
      order: {
        createdAt: 'DESC',
      },
    });
  }

  async validarTransicao(statusAntigo: Status, statusNovo: Status): Promise<void> {
    const transicoesPermitidas: Record<Status, Status[]> = {
      [Status.PENDENTE]: [Status.APROVADA, Status.REJEITADA, Status.CANCELADA],
      [Status.APROVADA]: [Status.REJEITADA, Status.CANCELADA, Status.FINALIZADA],
      [Status.REJEITADA]: [Status.PENDENTE],
      [Status.CANCELADA]: [],
      [Status.FINALIZADA]: [],
    };

    const transicoesValidas = transicoesPermitidas[statusAntigo] || [];

    if (!transicoesValidas.includes(statusNovo)) {
      throw new NotFoundException(
        `Transição de status inválida de "${statusAntigo}" para "${statusNovo}".`,
      );
    }
  }

  async validarTransicaoAprovacao(statusAntigo: Status): Promise<void> {
    if (statusAntigo !== Status.PENDENTE) {
      throw new NotFoundException(
        `Somente reservas com status "PENDENTE" podem ser aprovadas.`,
      );
    }
  }

  async validarTransicaoRejeicao(statusAntigo: Status): Promise<void> {
    if (statusAntigo === Status.CANCELADA || statusAntigo === Status.FINALIZADA) {
      throw new NotFoundException(
        `Reservas "CANCELADAS" ou "FINALIZADAS" não podem ser rejeitadas.`,
      );
    }
  }

  async validarTransicaoFinalizacao(statusAntigo: Status): Promise<void> {
    if (statusAntigo !== Status.APROVADA) {
      throw new NotFoundException(
        `Somente reservas com status "APROVADA" podem ser finalizadas.`,
      );
    }
  }

  async validarTransicaoCancelamentoUsuario(
    statusAntigo: Status,
    usuarioId: string,
    reservaTipo: ReservaLocal | ReservaEquipamento,
  ): Promise<void> {
    if (statusAntigo === Status.CANCELADA || statusAntigo === Status.FINALIZADA) {
      throw new NotFoundException(
        `Reservas "CANCELADAS" ou "FINALIZADAS" não podem ser canceladas.`,
      );
    }

    const solicitanteId = reservaTipo instanceof ReservaLocal
      ? reservaTipo.solicitante?.id
      : reservaTipo.solicitante?.id;

    if (solicitanteId !== usuarioId) {
      throw new NotFoundException('Apenas o solicitante pode cancelar esta reserva.');
    }
  }
}

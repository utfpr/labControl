import {
  Injectable,
  BadRequestException,
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ReservaLocal } from '../entities/reserva.local.entity';
import { Usuario } from '../entities/usuario.entity';
import { Local } from '../entities/local.entity';
import { Status, ReservaTipo } from '../../common/enums';
import { CriarReservaLocalDto } from './dto/criar-reserva-local.dto';
import { ConflitoReservasService, DateTimeRange } from '../shared/conflito-reservas.service';
import { HistoricoReservasService } from '../shared/historico-reservas.service';

@Injectable()
export class ReservasLocaisService {
  constructor(
    @InjectRepository(ReservaLocal)
    private reservasLocaisRepository: Repository<ReservaLocal>,
    private conflitoReservasService: ConflitoReservasService,
    private historicoReservasService: HistoricoReservasService,
  ) { }

  async criar(dados: CriarReservaLocalDto): Promise<ReservaLocal> {
    const inicio = new Date(dados.dataHoraInicio);
    const fim = new Date(dados.dataHoraFim);

    // Validar intervalo de datas
    const erroValidacao = this.conflitoReservasService.validateIntervaloDatas(inicio, fim);
    if (erroValidacao) {
      throw new BadRequestException(erroValidacao);
    }

    // Impedir reserva no passado
    const agora = new Date();
    agora.setMinutes(agora.getMinutes() - agora.getTimezoneOffset() / 60);
    if (inicio < agora) {
      throw new BadRequestException('Não é possível reservar datas no passado.');
    }

    const datetimeRange: DateTimeRange = { inicio, fim };

    // Verificar conflitos de reserva existentes
    const erroConflito = await this.conflitoReservasService.checkLocalReservaConflito(
      dados.localId,
      datetimeRange.inicio,
      datetimeRange.fim,
    );
    if (erroConflito) {
      throw new BadRequestException(erroConflito);
    }

    // Verificar conflitos com grade de aulas
    const erroGrade = await this.conflitoReservasService.checkGradeAulaConflito(
      dados.localId,
      datetimeRange.inicio,
      datetimeRange.fim,
    );
    if (erroGrade) {
      throw new BadRequestException(erroGrade);
    }

    // Todas as validações passaram - criar a reserva
    try {
      const novaReserva = await this.reservasLocaisRepository.save({
        dataHoraInicio: inicio,
        dataHoraFim: fim,
        motivo: dados.motivo,
        status: Status.PENDENTE,
        solicitante: { id: dados.solicitanteId } as Usuario,
        local: { id: dados.localId } as Local,
      });

      return novaReserva;
    } catch (error) {
      throw new InternalServerErrorException(
        'Erro ao criar reserva de local. Por favor, tente novamente.',
      );
    }
  }

  async listarTodas(): Promise<ReservaLocal[]> {
    return await this.reservasLocaisRepository.find({
      relations: ['solicitante', 'local'],
      order: { createdAt: 'DESC' }
    });
  }

  async listarMinhasReservas(usuarioId: string): Promise<ReservaLocal[]> {
    return await this.reservasLocaisRepository.find({
      where: { solicitante: { id: usuarioId } },
      relations: ['local'],
      order: { createdAt: 'DESC' }
    });
  }

  async obterReserva(id: string): Promise<ReservaLocal> {
    const reserva = await this.reservasLocaisRepository.findOne({
      where: { id },
      relations: ['solicitante', 'local'],
    });

    if (!reserva) {
      throw new NotFoundException('Reserva de local não encontrada.');
    }

    return reserva;
  }

  async aprovar(id: string, usuarioId: string): Promise<ReservaLocal> {
    const reserva = await this.obterReserva(id);

    await this.historicoReservasService.validarTransicaoAprovacao(reserva.status);

    const statusAntigo = reserva.status;
    reserva.status = Status.APROVADA;
    const novaReserva = await this.reservasLocaisRepository.save(reserva);

    await this.historicoReservasService.criarRegistro(
      reserva.id,
      ReservaTipo.LOCAL,
      usuarioId,
      statusAntigo,
      Status.APROVADA,
    );

    return novaReserva;
  }

  async rejeitar(id: string, usuarioId: string): Promise<ReservaLocal> {
    const reserva = await this.obterReserva(id);

    await this.historicoReservasService.validarTransicaoRejeicao(reserva.status);

    const statusAntigo = reserva.status;
    reserva.status = Status.REJEITADA;
    const novaReserva = await this.reservasLocaisRepository.save(reserva);

    await this.historicoReservasService.criarRegistro(
      reserva.id,
      ReservaTipo.LOCAL,
      usuarioId,
      statusAntigo,
      Status.REJEITADA,
    );

    return novaReserva;
  }

  async finalizar(id: string, usuarioId: string): Promise<ReservaLocal> {
    const reserva = await this.obterReserva(id);

    await this.historicoReservasService.validarTransicaoFinalizacao(reserva.status);

    const statusAntigo = reserva.status;
    reserva.status = Status.FINALIZADA;
    const novaReserva = await this.reservasLocaisRepository.save(reserva);

    await this.historicoReservasService.criarRegistro(
      reserva.id,
      ReservaTipo.LOCAL,
      usuarioId,
      statusAntigo,
      Status.FINALIZADA,
    );

    return novaReserva;
  }

  async cancelar(
    id: string,
    usuarioId: string,
    userId: string,
  ): Promise<ReservaLocal> {
    const reserva = await this.obterReserva(id);

    await this.historicoReservasService.validarTransicaoCancelamentoUsuario(
      reserva.status,
      userId,
      reserva,
    );

    const statusAntigo = reserva.status;
    reserva.status = Status.CANCELADA;
    const novaReserva = await this.reservasLocaisRepository.save(reserva);

    await this.historicoReservasService.criarRegistro(
      reserva.id,
      ReservaTipo.LOCAL,
      usuarioId,
      statusAntigo,
      Status.CANCELADA,
    );

    return novaReserva;
  }

  async getHistoricoPorReserva(reservaId: string) {
    return this.historicoReservasService.getHistoricoPorReserva(
      reservaId,
      ReservaTipo.LOCAL,
    );
  }
}

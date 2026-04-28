import {
  Injectable,
  BadRequestException,
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { ReservaEquipamento } from '../entities/reserva.equipamento.entity';
import { Usuario } from '../entities/usuario.entity';
import { Equipamento } from '../entities/equipamento.entity';
import { Status, ReservaTipo } from '../../common/enums';
import { CriarReservaEquipamentoDto } from './dto/criar-reserva-equipamento.dto';
import { ConflitoReservasService, DateTimeRange } from '../shared/conflito-reservas.service';
import { HistoricoReservasService } from '../shared/historico-reservas.service';

@Injectable()
export class ReservasEquipamentosService {
  constructor(
    @InjectRepository(ReservaEquipamento)
    private reservasEquipamentosRepository: Repository<ReservaEquipamento>,
    private conflitoReservasService: ConflitoReservasService,
    private historicoReservasService: HistoricoReservasService,
  ) { }

  async criar(dados: CriarReservaEquipamentoDto): Promise<ReservaEquipamento> {
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

    // Verificar conflitos de reserva existentes para o equipamento
    const erroConflito = await this.conflitoReservasService.checkEquipamentoReservaConflito(
      dados.equipamentoId,
      datetimeRange.inicio,
      datetimeRange.fim,
    );
    if (erroConflito) {
      throw new BadRequestException(erroConflito);
    }

    // Verificar conflitos de ocupação do local
    const erroLocal = await this.conflitoReservasService.checkEquipamentoLocalConflito(
      dados.equipamentoId,
      datetimeRange.inicio,
      datetimeRange.fim,
    );
    if (erroLocal) {
      throw new BadRequestException(erroLocal);
    }

    // Todas as validações passaram - criar a reserva
    try {
      const novaReserva = await this.reservasEquipamentosRepository.save({
        dataHoraInicio: inicio,
        dataHoraFim: fim,
        motivo: dados.motivo,
        status: Status.PENDENTE,
        solicitante: { id: dados.solicitanteId } as Usuario,
        equipamento: { id: dados.equipamentoId } as Equipamento,
      });

      return novaReserva;
    } catch (error) {
      throw new InternalServerErrorException(
        'Erro ao criar reserva de equipamento. Por favor, tente novamente.', error
      );
    }
  }

  async listarTodas(): Promise<ReservaEquipamento[]> {
    return await this.reservasEquipamentosRepository.find({
      relations: ['solicitante', 'equipamento'],
      order: { createdAt: 'DESC' }
    });
  }

  async listarMinhasReservas(usuarioId: string): Promise<ReservaEquipamento[]> {
    return await this.reservasEquipamentosRepository.find({
      where: { solicitante: { id: usuarioId } },
      relations: ['equipamento', 'equipamento.local'],
      order: { createdAt: 'DESC' }
    });
  }

  async aprovar(id: string, usuarioId: string): Promise<ReservaEquipamento> {
    const reserva = await this.obterReserva(id);

    await this.historicoReservasService.validarTransicaoAprovacao(reserva.status);

    const statusAntigo = reserva.status;
    reserva.status = Status.APROVADA;
    const novaReserva = await this.reservasEquipamentosRepository.save(reserva);

    await this.historicoReservasService.criarRegistro(
      reserva.id,
      ReservaTipo.EQUIPAMENTO,
      usuarioId,
      statusAntigo,
      Status.APROVADA,
    );

    return novaReserva;
  }

  async rejeitar(id: string, usuarioId: string): Promise<ReservaEquipamento> {
    const reserva = await this.obterReserva(id);

    await this.historicoReservasService.validarTransicaoRejeicao(reserva.status);

    const statusAntigo = reserva.status;
    reserva.status = Status.REJEITADA;
    const novaReserva = await this.reservasEquipamentosRepository.save(reserva);

    await this.historicoReservasService.criarRegistro(
      reserva.id,
      ReservaTipo.EQUIPAMENTO,
      usuarioId,
      statusAntigo,
      Status.REJEITADA,
    );

    return novaReserva;
  }

  async cancelar(id: string, usuarioId: string, userId: string): Promise<ReservaEquipamento> {
    const reserva = await this.obterReserva(id);

    await this.historicoReservasService.validarTransicaoCancelamentoUsuario(
      reserva.status,
      userId,
      reserva,
    );

    const statusAntigo = reserva.status;
    reserva.status = Status.CANCELADA;
    const novaReserva = await this.reservasEquipamentosRepository.save(reserva);

    await this.historicoReservasService.criarRegistro(
      reserva.id,
      ReservaTipo.EQUIPAMENTO,
      usuarioId,
      statusAntigo,
      Status.CANCELADA,
    );

    return novaReserva;
  }

  async finalizar(id: string, usuarioId: string): Promise<ReservaEquipamento> {
    const reserva = await this.obterReserva(id);

    await this.historicoReservasService.validarTransicaoFinalizacao(reserva.status);

    const statusAntigo = reserva.status;
    reserva.status = Status.FINALIZADA;
    const novaReserva = await this.reservasEquipamentosRepository.save(reserva);

    await this.historicoReservasService.criarRegistro(
      reserva.id,
      ReservaTipo.EQUIPAMENTO,
      usuarioId,
      statusAntigo,
      Status.FINALIZADA,
    );

    return novaReserva;
  }

  async getHistoricoPorReserva(reservaId: string): Promise<any[]> {
    return this.historicoReservasService.getHistoricoPorReserva(
      reservaId,
      ReservaTipo.EQUIPAMENTO,
    );
  }

  private async obterReserva(id: string): Promise<ReservaEquipamento> {
    const reserva = await this.reservasEquipamentosRepository.findOne({
      where: { id },
      relations: ['solicitante'],
    });

    if (!reserva) {
      throw new NotFoundException('Reserva de equipamento não encontrada.');
    }

    return reserva;
  }

  async alterarStatus(id: string, novoStatus: Status): Promise<ReservaEquipamento> {
    const reserva = await this.reservasEquipamentosRepository.findOneBy({ id });

    if (!reserva) {
      throw new NotFoundException('Reserva não encontrada.');
    }

    reserva.status = novoStatus;
    return await this.reservasEquipamentosRepository.save(reserva);
  }

  async countByStatus(): Promise<{ confirmadas: number; pendentes: number }> {
    const statusCounts = await this.reservasEquipamentosRepository
      .createQueryBuilder('reserva')
      .select('reserva.status', 'status')
      .addSelect('COUNT(*)', 'count')
      .groupBy('reserva.status')
      .getRawMany();

    const stats = { confirmadas: 0, pendentes: 0 };
    statusCounts.forEach((row: any) => {
      if (row.status === Status.APROVADA) stats.confirmadas = Number(row.count);
      if (row.status === Status.PENDENTE) stats.pendentes = Number(row.count);
    });

    return stats;
  }

  async buscarPorData(data: string): Promise<ReservaEquipamento[]> {
    const startOfDay = new Date(data);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(data);
    endOfDay.setHours(23, 59, 59, 999);

    return await this.reservasEquipamentosRepository.find({
      where: {
        dataHoraInicio: Between(startOfDay, endOfDay)
      },
      relations: ['solicitante', 'equipamento']
    });
  }
}

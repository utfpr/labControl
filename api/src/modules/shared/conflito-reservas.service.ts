import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { ReservaLocal } from '../entities/reserva.local.entity';
import { ReservaEquipamento } from '../entities/reserva.equipamento.entity';
import { Aula } from '../entities/aula.entity';
import { Equipamento } from '../entities/equipamento.entity';
import { Status } from '../../common/enums';

export interface DateTimeRange {
  inicio: Date;
  fim: Date;
}

@Injectable()
export class ConflitoReservasService {
  constructor(
    @InjectRepository(ReservaLocal)
    private reservasLocaisRepository: Repository<ReservaLocal>,
    @InjectRepository(ReservaEquipamento)
    private reservasEquipamentosRepository: Repository<ReservaEquipamento>,
    @InjectRepository(Aula)
    private aulasRepository: Repository<Aula>,
    @InjectRepository(Equipamento)
    private equipamentosRepository: Repository<Equipamento>,
    private dataSource: DataSource,
  ) {}

  /**
   * Check for booking conflicts for a location
   */
  async checkLocalReservaConflito(
    localId: string,
    dataHoraInicio: Date,
    dataHoraFim: Date,
  ): Promise<string | null> {
    const conflito = await this.reservasLocaisRepository.createQueryBuilder('reserva')
      .where('reserva.local_id = :localId', { localId })
      .andWhere('reserva.status IN (:...status)', { status: [Status.PENDENTE, Status.APROVADA] })
      .andWhere('reserva.dataHoraInicio < :fim', { fim: dataHoraFim })
      .andWhere('reserva.dataHoraFim > :inicio', { inicio: dataHoraInicio })
      .getOne();

    if (conflito) {
      return 'Este laboratório já possui uma reserva ativa para este horário.';
    }

    return null;
  }

  /**
   * Check for academic schedule conflicts for a location at a specific datetime
   */
  async checkGradeAulaConflito(
    localId: string,
    dataHoraInicio: Date,
    dataHoraFim: Date,
  ): Promise<string | null> {
    const dataReservaString = dataHoraInicio.toISOString().split('T')[0];
    const diaSemanaJS = dataHoraInicio.getDay();
    const diaSemanaAula = diaSemanaJS === 0 ? 7 : diaSemanaJS;
    const horaInicio = dataHoraInicio.toTimeString().split(' ')[0];
    const horaFim = dataHoraFim.toTimeString().split(' ')[0];

    const aulasNoLocal = await this.aulasRepository.createQueryBuilder('aula')
      .where('aula.local_id = :localId', { localId })
      .andWhere('aula.data_inicio <= :data', { data: dataReservaString })
      .andWhere('aula.data_fim >= :data', { data: dataReservaString })
      .andWhere('aula.dia_semana = :diaSemana', { diaSemana: diaSemanaAula })
      .getMany();

    for (const aula of aulasNoLocal) {
      if (aula.horaInicio < horaFim && aula.horaFim > horaInicio) {
        return `Local indisponível. Há uma aula cadastrada na grade das ${aula.horaInicio} às ${aula.horaFim}.`;
      }
    }

    return null;
  }

  /**
   * Check for equipment booking conflicts
   */
  async checkEquipamentoReservaConflito(
    equipamentoId: string,
    dataHoraInicio: Date,
    dataHoraFim: Date,
  ): Promise<string | null> {
    const conflito = await this.reservasEquipamentosRepository.createQueryBuilder('reserva')
      .where('reserva.equipamento_id = :equipamentoId', { equipamentoId })
      .andWhere('reserva.status IN (:...status)', { status: [Status.PENDENTE, Status.APROVADA] })
      .andWhere('reserva.dataHoraInicio < :fim', { fim: dataHoraFim })
      .andWhere('reserva.dataHoraFim > :inicio', { inicio: dataHoraInicio })
      .getOne();

    if (conflito) {
      return 'Este equipamento já está reservado por outra pessoa neste horário.';
    }

    return null;
  }

  /**
   * Check if equipment's location is occupied by a class at the requested time
   */
  async checkEquipamentoLocalConflito(
    equipamentoId: string,
    dataHoraInicio: Date,
    dataHoraFim: Date,
  ): Promise<string | null> {
    const equipamento = await this.equipamentosRepository.findOne({
      where: { id: equipamentoId },
      relations: ['local'],
    });

    if (!equipamento || !equipamento.local) {
      return 'Equipamento não encontrado ou sem um local físico atrelado.';
    }

    const dataReservaString = dataHoraInicio.toISOString().split('T')[0];
    const diaSemanaJS = dataHoraInicio.getDay();
    const diaSemanaAula = diaSemanaJS === 0 ? 7 : diaSemanaJS;
    const horaInicio = dataHoraInicio.toTimeString().split(' ')[0];
    const horaFim = dataHoraFim.toTimeString().split(' ')[0];

    const aulasNoLocal = await this.aulasRepository.createQueryBuilder('aula')
      .where('aula.local_id = :localId', { localId: equipamento.local.id })
      .andWhere('aula.data_inicio <= :data', { data: dataReservaString })
      .andWhere('aula.data_fim >= :data', { data: dataReservaString })
      .andWhere('aula.dia_semana = :diaSemana', { diaSemana: diaSemanaAula })
      .getMany();

    for (const aula of aulasNoLocal) {
      if (aula.horaInicio < horaFim && aula.horaFim > horaInicio) {
        return `O laboratório onde este equipamento está alocado (${equipamento.local.nome}) estará ocupado por uma aula das ${aula.horaInicio} às ${aula.horaFim}.`;
      }
    }

    return null;
  }

  /**
   * Validate that end datetime is after start datetime
   */
  validateIntervaloDatas(inicio: Date, fim: Date): string | null {
    if (inicio >= fim) {
      return 'A data de início deve ser anterior à data de fim.';
    }
    return null;
  }
}

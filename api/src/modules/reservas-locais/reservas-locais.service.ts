import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { ReservaLocal } from '../entities/reserva.local.entity';
import { Aula } from '../entities/aula.entity';
import { Status } from '../../common/enums';

@Injectable()
export class ReservasLocaisService {
  constructor(
    @InjectRepository(ReservaLocal)
    private reservasLocaisRepository: Repository<ReservaLocal>,
    private dataSource: DataSource,
  ) { }

  async criar(dados: any): Promise<ReservaLocal> {
    const inicio = new Date(dados.dataHoraInicio || dados.dataInicio);
    const fim = new Date(dados.dataHoraFim || dados.dataFim);

    if (inicio >= fim) {
      throw new BadRequestException('A data de início deve ser anterior à data de fim.');
    }

    // REGRA 1: Choque com outras Reservas (Double Booking)
    const conflitoReserva = await this.reservasLocaisRepository.createQueryBuilder('reserva')
      .where('reserva.local_id = :localId', { localId: dados.localId })
      .andWhere('reserva.status IN (:...status)', { status: [Status.PENDENTE, Status.APROVADA] })
      .andWhere('reserva.dataHoraInicio < :fim', { fim })
      .andWhere('reserva.dataHoraFim > :inicio', { inicio })
      .getOne();

    if (conflitoReserva) {
      throw new BadRequestException('Este laboratório já possui uma reserva ativa para este horário.');
    }

    // REGRA 2: Choque com a Grade de Aulas (Recorrência)
    const aulasRepository = this.dataSource.getRepository(Aula);
    const dataReservaString = inicio.toISOString().split('T')[0]; // Extrai "YYYY-MM-DD"
    const diaSemanaJS = inicio.getDay(); // Retorna 0 (Dom) a 6 (Sáb)
    const diaSemanaAula = diaSemanaJS === 0 ? 7 : diaSemanaJS; // Converte para o seu padrão (1 a 7)

    const horaReservaInicio = inicio.toTimeString().split(' ')[0]; // Extrai "HH:MM:SS"
    const horaReservaFim = fim.toTimeString().split(' ')[0];

    const aulasNoLocal = await aulasRepository.createQueryBuilder('aula')
      .where('aula.local_id = :localId', { localId: dados.localId })
      .andWhere('aula.data_inicio <= :data', { data: dataReservaString })
      .andWhere('aula.data_fim >= :data', { data: dataReservaString })
      .andWhere('aula.dia_semana = :diaSemana', { diaSemana: diaSemanaAula })
      .getMany();

    // Se houverem aulas no local no mesmo dia da semana, checamos a intersecção de horas
    for (const aula of aulasNoLocal) {
      if (aula.horaInicio < horaReservaFim && aula.horaFim > horaReservaInicio) {
        throw new BadRequestException(`Local indisponível. Há uma aula cadastrada na grade das ${aula.horaInicio} às ${aula.horaFim}.`);
      }
    }

    // Se sobreviveu às validações, o caminho está livre!
    const novaReserva = this.reservasLocaisRepository.create({
      dataHoraInicio: inicio,
      dataHoraFim: fim,
      motivo: dados.motivo,
      status: Status.PENDENTE, // Segurança: força estado inicial pendente
      solicitante: { id: dados.solicitanteId },
      local: { id: dados.localId },
    } as unknown as ReservaLocal);

    return await this.reservasLocaisRepository.save(novaReserva);
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

  async alterarStatus(id: string, novoStatus: Status): Promise<ReservaLocal> {
    const reserva = await this.reservasLocaisRepository.findOneBy({ id });

    if (!reserva) {
      throw new NotFoundException('Reserva de local não encontrada.');
    }

    reserva.status = novoStatus;
    return await this.reservasLocaisRepository.save(reserva);
  }
}
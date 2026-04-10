import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { ReservaLocal } from '../entities/reserva.local.entity';
import { Aula } from '../entities/aula.entity';
import { Status } from '../../common/enums'; // Ajuste o caminho se a sua pasta common estiver em outro nível

@Injectable()
export class ReservasLocaisService {
  constructor(
    @InjectRepository(ReservaLocal)
    private reservasLocaisRepository: Repository<ReservaLocal>,
    private dataSource: DataSource,
  ) {}

  async criar(dados: any): Promise<ReservaLocal> {
    const inicio = new Date(dados.dataHoraInicio || dados.dataInicio);
    const fim = new Date(dados.dataHoraFim || dados.dataFim);

    if (inicio >= fim) {
      throw new BadRequestException('A data de início deve ser anterior à data de fim.');
    }

    // REGRA 1: Choque com outras Reservas (Double Booking)
    const conflitoReserva = await this.reservasLocaisRepository.createQueryBuilder('reserva')
      .where('reserva.localId = :localId', { localId: dados.localId })
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
      .where('aula.localId = :localId', { localId: dados.localId })
      .andWhere('aula.dataInicio <= :data', { data: dataReservaString }) // A reserva ocorre dentro do semestre?
      .andWhere('aula.dataFim >= :data', { data: dataReservaString })
      .andWhere('aula.diaSemana = :diaSemana', { diaSemana: diaSemanaAula }) // É no mesmo dia da semana?
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
      status: dados.status || Status.PENDENTE,
      solicitante: { id: dados.solicitanteId },
      local: { id: dados.localId },
    } as unknown as ReservaLocal);

    return await this.reservasLocaisRepository.save(novaReserva);
  }

  async listarTodas(): Promise<ReservaLocal[]> {
    return await this.reservasLocaisRepository.find({
      relations: ['solicitante', 'local'],
    });
  }
}
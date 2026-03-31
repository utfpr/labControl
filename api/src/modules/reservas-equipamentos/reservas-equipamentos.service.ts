import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { ReservaEquipamento } from '../entities/reserva.equipamento.entity';
import { Equipamento } from '../entities/equipamento.entity';
import { Aula } from '../entities/aula.entity';
import { Status } from '../../common/enums'; // Ajuste o caminho se necessário

@Injectable()
export class ReservasEquipamentosService {
  constructor(
    @InjectRepository(ReservaEquipamento)
    private reservasEquipamentosRepository: Repository<ReservaEquipamento>,
    private dataSource: DataSource,
  ) {}

  async criar(dados: any): Promise<ReservaEquipamento> {
    const inicio = new Date(dados.dataHoraInicio || dados.dataInicio);
    const fim = new Date(dados.dataHoraFim || dados.dataFim);

    if (inicio >= fim) {
      throw new BadRequestException('A data de início deve ser anterior à data de fim.');
    }

    // REGRA 1: Choque com outras Reservas do mesmo Equipamento
    const conflitoReserva = await this.reservasEquipamentosRepository.createQueryBuilder('reserva')
      .where('reserva.equipamentoId = :equipamentoId', { equipamentoId: dados.equipamentoId })
      .andWhere('reserva.status IN (:...status)', { status: [Status.PENDENTE, Status.APROVADA] })
      .andWhere('reserva.dataHoraInicio < :fim', { fim })
      .andWhere('reserva.dataHoraFim > :inicio', { inicio })
      .getOne();

    if (conflitoReserva) {
      throw new BadRequestException('Este equipamento já está reservado por outra pessoa neste horário.');
    }

    // REGRA 2: Rastrear o Local do Equipamento
    const equipamentoRepository = this.dataSource.getRepository(Equipamento);
    const equipamento = await equipamentoRepository.findOne({
      where: { id: dados.equipamentoId },
      relations: ['local'] // Trazemos o local físico junto
    });

    if (!equipamento || !equipamento.local) {
      throw new BadRequestException('Equipamento não encontrado ou sem um local físico atrelado.');
    }

    // REGRA 3: O equipamento não pode ser usado se o laboratório dele estiver ocupado por uma Aula
    const aulasRepository = this.dataSource.getRepository(Aula);
    const dataReservaString = inicio.toISOString().split('T')[0];
    const diaSemanaJS = inicio.getDay();
    const diaSemanaAula = diaSemanaJS === 0 ? 7 : diaSemanaJS;

    const horaReservaInicio = inicio.toTimeString().split(' ')[0];
    const horaReservaFim = fim.toTimeString().split(' ')[0];

    const aulasNoLocal = await aulasRepository.createQueryBuilder('aula')
      .where('aula.localId = :localId', { localId: equipamento.local.id }) // Compara com o local DO equipamento
      .andWhere('aula.dataInicio <= :data', { data: dataReservaString })
      .andWhere('aula.dataFim >= :data', { data: dataReservaString })
      .andWhere('aula.diaSemana = :diaSemana', { diaSemana: diaSemanaAula })
      .getMany();

    for (const aula of aulasNoLocal) {
      if (aula.horaInicio < horaReservaFim && aula.horaFim > horaReservaInicio) {
        throw new BadRequestException(`O laboratório onde este equipamento está alocado (${equipamento.local.nome}) estará ocupado por uma aula das ${aula.horaInicio} às ${aula.horaFim}.`);
      }
    }

    // Tudo certo, salva a reserva
    const novaReserva = this.reservasEquipamentosRepository.create({
      dataHoraInicio: inicio,
      dataHoraFim: fim,
      motivo: dados.motivo,
      status: dados.status || Status.PENDENTE,
      solicitante: { id: dados.solicitanteId },
      equipamento: { id: dados.equipamentoId },
    } as unknown as ReservaEquipamento);

    return await this.reservasEquipamentosRepository.save(novaReserva);
  }

  async listarTodas(): Promise<ReservaEquipamento[]> {
    return await this.reservasEquipamentosRepository.find({
      relations: ['solicitante', 'equipamento'],
    });
  }
}
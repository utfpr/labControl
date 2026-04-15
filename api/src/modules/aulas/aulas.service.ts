import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Aula } from '../entities/aula.entity';
import { CriarAulaDto } from './dto/criar-aula.dto';

@Injectable()
export class AulasService {
  constructor(
    @InjectRepository(Aula)
    private aulasRepository: Repository<Aula>,
  ) {}

  async criar(dados: CriarAulaDto): Promise<Aula> {
    const { disciplinaId, localId, professorId, ...dadosAula } = dados;

    // Validações básicas
    if (dadosAula.dataInicio >= dadosAula.dataFim) {
      throw new BadRequestException('A data de início do semestre deve ser anterior à data de fim.');
    }
    if (dadosAula.horaInicio >= dadosAula.horaFim) {
      throw new BadRequestException('A hora de início da aula deve ser anterior à hora de término.');
    }

    // REGRA DE OURO: Evitar choque de grade de aulas no mesmo laboratório
    const conflito = await this.aulasRepository.createQueryBuilder('aula')
      .where('aula.local_id = :localId', { localId })
      .andWhere('aula.dia_semana = :diaSemana', { diaSemana: dadosAula.diaSemana })
      // Verifica intersecção de dias (se os semestres se sobrepõem)
      .andWhere('aula.data_inicio <= :dataFim', { dataFim: dadosAula.dataFim })
      .andWhere('aula.data_fim >= :dataInicio', { dataInicio: dadosAula.dataInicio })
      // Verifica intersecção de horas
      .andWhere('aula.hora_inicio < :horaFim', { horaFim: dadosAula.horaFim })
      .andWhere('aula.hora_fim > :horaInicio', { horaInicio: dadosAula.horaInicio })
      .getOne();

    if (conflito) {
      throw new BadRequestException('Este laboratório já possui uma aula alocada neste mesmo dia e horário durante o período informado.');
    }

    const novaAula = this.aulasRepository.create({
      ...dadosAula,
      disciplina: { id: disciplinaId },
      local: { id: localId },
      professor: { id: professorId },
    } as unknown as Aula);

    return await this.aulasRepository.save(novaAula);
  }

  async listarTodas(): Promise<Aula[]> {
    return await this.aulasRepository.find({
      relations: ['disciplina', 'local', 'professor'],
      order: { dataInicio: 'DESC' } // Lista as mais recentes primeiro
    });
  }
}
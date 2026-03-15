import { Injectable } from '@nestjs/common';
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

    const novaAula = this.aulasRepository.create({
      ...dadosAula,
      disciplina: { id: disciplinaId },
      local: { id: localId },
      professor: { id: professorId },
    });

    return await this.aulasRepository.save(novaAula);
  }

  async listarTodas(): Promise<Aula[]> {
    return await this.aulasRepository.find({
      relations: ['disciplina', 'local', 'professor'],
    });
  }
}
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Disciplina } from '../entities/disciplina.entity';
import { CriarDisciplinaDto } from './dto/criar-disciplina.dto';

@Injectable()
export class DisciplinasService {
  constructor(
    @InjectRepository(Disciplina)
    private disciplinasRepository: Repository<Disciplina>,
  ) {}

  async criar(dados: CriarDisciplinaDto): Promise<Disciplina> {
    const { responsavelId, ...dadosDisciplina } = dados;

    const novaDisciplina = this.disciplinasRepository.create({
      ...dadosDisciplina,
      responsavel: { id: responsavelId },
    });

    return await this.disciplinasRepository.save(novaDisciplina);
  }

  async listarTodas(): Promise<Disciplina[]> {
    return await this.disciplinasRepository.find({
      relations: ['responsavel'],
    });
  }
}
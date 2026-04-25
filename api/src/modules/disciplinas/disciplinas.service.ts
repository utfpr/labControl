import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Disciplina } from '../entities/disciplina.entity';
import { CriarDisciplinaDto } from './dto/criar-disciplina.dto';
import { Usuario } from '../entities/usuario.entity';

@Injectable()
export class DisciplinasService {
  constructor(
    @InjectRepository(Disciplina)
    private disciplinasRepository: Repository<Disciplina>,
    @InjectRepository(Usuario)
    private usuariosRepository: Repository<Usuario>,
  ) {}

  async criar(dados: CriarDisciplinaDto): Promise<Disciplina> {
    const { responsavelId, ...dadosDisciplina } = dados;

    const responsavel = await this.usuariosRepository.findOneBy({ id: responsavelId });
    if (!responsavel) {
      throw new BadRequestException('Responsável não encontrado.');
    }

    if (responsavel.role !== 'PROFESSOR') {
      throw new BadRequestException('O responsável deve ter a função de PROFESSOR.');
    }

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

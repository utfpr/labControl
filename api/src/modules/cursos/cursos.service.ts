import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Curso } from '../entities/curso.entity'; // Ajuste o caminho

@Injectable()
export class CursosService {
  constructor(
    @InjectRepository(Curso)
    private cursosRepository: Repository<Curso>,
  ) {}

  async criar(dados: Partial<Curso>): Promise<Curso> {
    const novoCurso = this.cursosRepository.create(dados);
    return await this.cursosRepository.save(novoCurso);
  }

  async listarTodos(): Promise<Curso[]> {
    return await this.cursosRepository.find();
  }
}
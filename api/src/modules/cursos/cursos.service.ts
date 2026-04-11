import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Curso } from '../entities/curso.entity'; 

@Injectable()
export class CursosService {
  constructor(
    @InjectRepository(Curso)
    private cursosRepository: Repository<Curso>,
  ) {}

  async criar(dados: any): Promise<Curso> {
    const novoCurso = this.cursosRepository.create({
      nome: dados.nome,
      coordenador: dados.coordenador, // 👈 Ajustado para bater com o banco
    });

    return await this.cursosRepository.save(novoCurso);
  }

  async listarTodos(): Promise<Curso[]> {
    return await this.cursosRepository.find({
      order: { nome: 'ASC' }
    });
  }

  async atualizar(id: string, dados: any): Promise<Curso> {
    const curso = await this.cursosRepository.findOneBy({ id });
    
    if (!curso) throw new NotFoundException('Curso não encontrado.');

    if (dados.nome) curso.nome = dados.nome;
    if (dados.coordenador !== undefined) curso.coordenador = dados.coordenador; // 👈 Ajustado aqui

    return await this.cursosRepository.save(curso);
  }

  async remover(id: string): Promise<void> {
    const curso = await this.cursosRepository.findOneBy({ id });
    if (!curso) throw new NotFoundException('Curso não encontrado.');
    
    await this.cursosRepository.remove(curso);
  }
}
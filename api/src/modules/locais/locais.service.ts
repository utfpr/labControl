import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Local } from '../entities/local.entity'; // Verifique o caminho da sua entidade

@Injectable()
export class LocaisService {
  constructor(
    @InjectRepository(Local)
    private locaisRepository: Repository<Local>,
  ) {}

  async criar(dados: any): Promise<Local> {
    const novoLocal = this.locaisRepository.create({
      nome: dados.nome,
      descricao: dados.descricao,
    });

    return await this.locaisRepository.save(novoLocal);
  }

  async listarTodos(): Promise<Local[]> {
    return await this.locaisRepository.find({
      order: { nome: 'ASC' } // Lista em ordem alfabética (ex: C001, C005, C105...)
    });
  }

  async atualizar(id: string, dados: any): Promise<Local> {
    const local = await this.locaisRepository.findOneBy({ id });
    
    if (!local) throw new NotFoundException('Local não encontrado.');

    if (dados.nome) local.nome = dados.nome;
    if (dados.descricao !== undefined) local.descricao = dados.descricao;

    return await this.locaisRepository.save(local);
  }

  async remover(id: string): Promise<void> {
    const local = await this.locaisRepository.findOneBy({ id });
    if (!local) throw new NotFoundException('Local não encontrado.');
    
    await this.locaisRepository.remove(local);
  }
}
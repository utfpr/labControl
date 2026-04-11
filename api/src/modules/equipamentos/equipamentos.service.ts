import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Equipamento } from '../entities/equipamento.entity';

@Injectable()
export class EquipamentosService {
  constructor(
    @InjectRepository(Equipamento)
    private equipamentosRepository: Repository<Equipamento>,
  ) { }

  async criar(dados: any, caminhoArquivoPop?: string): Promise<Equipamento> {
    const novoEquipamento = this.equipamentosRepository.create({
      nome: dados.nome,
      patrimonio: dados.patrimonio,
      status: dados.status || 'normal',
      arquivoPop: caminhoArquivoPop,
    });

    if (dados.cursoId) novoEquipamento.curso = { id: dados.cursoId } as any;
    if (dados.localId) novoEquipamento.local = { id: dados.localId } as any;

    return await this.equipamentosRepository.save(novoEquipamento);
  }

  async listarTodos(): Promise<Equipamento[]> {
    return await this.equipamentosRepository.find({
      relations: ['curso', 'local'],
      order: { createdAt: 'DESC' } // Mostra os mais recentes primeiro
    });
  }

  async atualizar(id: string, dados: any, caminhoArquivoPop?: string): Promise<Equipamento> {
    const equipamento = await this.equipamentosRepository.findOneBy({ id });

    if (!equipamento) throw new NotFoundException('Equipamento não encontrado.');

    // Atualiza apenas os campos que vieram na requisição
    if (dados.nome) equipamento.nome = dados.nome;
    if (dados.patrimonio) equipamento.patrimonio = dados.patrimonio;
    if (dados.status) equipamento.status = dados.status;
    if (caminhoArquivoPop) equipamento.arquivoPop = caminhoArquivoPop;

    if (dados.cursoId) equipamento.curso = { id: dados.cursoId } as any;
    if (dados.localId) equipamento.local = { id: dados.localId } as any;

    return await this.equipamentosRepository.save(equipamento);
  }

  async remover(id: string): Promise<void> {
    const equipamento = await this.equipamentosRepository.findOneBy({ id });
    if (!equipamento) throw new NotFoundException('Equipamento não encontrado.');

    await this.equipamentosRepository.remove(equipamento);
  }

  async atualizarPop(id: string, caminhoArquivo: string): Promise<Equipamento> {
    const equipamento = await this.equipamentosRepository.findOneBy({ id });
    if (!equipamento) throw new NotFoundException('Equipamento não encontrado.');

    equipamento.arquivoPop = caminhoArquivo;
    return await this.equipamentosRepository.save(equipamento);
  }
}
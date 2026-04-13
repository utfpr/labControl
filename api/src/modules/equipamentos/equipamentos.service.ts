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
      marca: dados.marca,
      especificacao: dados.especificacao,
      arquivoPop: caminhoArquivoPop,
    });

    if (dados.cursoId) novoEquipamento.curso = { id: dados.cursoId } as any;
    if (dados.localId) novoEquipamento.local = { id: dados.localId } as any;

    return await this.equipamentosRepository.save(novoEquipamento);
  }

  async listarTodos(): Promise<Equipamento[]> {
    return await this.equipamentosRepository.find({
      relations: ['curso', 'local'],
      order: { createdAt: 'DESC' } 
    });
  }

  async atualizar(id: string, dados: any, caminhoArquivoPop?: string): Promise<Equipamento> {
    const equipamento = await this.equipamentosRepository.findOneBy({ id });

    if (!equipamento) throw new NotFoundException('Equipamento não encontrado.');

    // Atualiza com segurança os campos presentes
    if (dados.nome !== undefined) equipamento.nome = dados.nome;
    if (dados.patrimonio !== undefined) equipamento.patrimonio = dados.patrimonio;
    if (dados.status !== undefined) equipamento.status = dados.status;
    if (dados.marca !== undefined) equipamento.marca = dados.marca;
    if (dados.especificacao !== undefined) equipamento.especificacao = dados.especificacao;
    
    // Se enviou um novo arquivo, sobrescreve o caminho
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
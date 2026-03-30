import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Equipamento } from '../entities/equipamento.entity';
import { CriarEquipamentoDto } from './dto/criar-equipamento.dto';

@Injectable()
export class EquipamentosService {
  constructor(
    @InjectRepository(Equipamento)
    private equipamentosRepository: Repository<Equipamento>,
  ) {}

  async criar(dados: any): Promise<Equipamento> {
    const novaReserva = this.equipamentosRepository.create({
      dataHoraInicio: dados.dataHoraInicio || dados.dataInicio,
      dataHoraFim: dados.dataHoraFim || dados.dataFim,
      motivo: dados.motivo,
      status: dados.status,
      solicitante: { id: dados.solicitanteId },
      equipamento: { id: dados.equipamentoId },
    } as unknown as Equipamento);

    return await this.equipamentosRepository.save(novaReserva);
  }

  async listarTodos(): Promise<Equipamento[]> {
    return await this.equipamentosRepository.find({
      relations: ['curso', 'local'],
    });
  }

  async atualizarPop(id: string, caminhoArquivo: string): Promise<Equipamento> {
    const equipamento = await this.equipamentosRepository.findOneBy({ id });
    
    if (!equipamento) {
      throw new NotFoundException('Equipamento não encontrado.');
    }

    equipamento.arquivoPop = caminhoArquivo; // Salva o caminho físico do PDF no banco
    return await this.equipamentosRepository.save(equipamento);
  }
}
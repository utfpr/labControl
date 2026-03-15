import { Injectable } from '@nestjs/common';
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

  async criar(dados: CriarEquipamentoDto): Promise<Equipamento> {
    const { cursoId, localId, ...dadosEquipamento } = dados;

    const novoEquipamento = this.equipamentosRepository.create({
      ...dadosEquipamento,
      curso: { id: cursoId },
      local: { id: localId },
    });

    return await this.equipamentosRepository.save(novoEquipamento);
  }

  async listarTodos(): Promise<Equipamento[]> {
    // Traz o equipamento já preenchido com os dados do curso e do local onde ele está
    return await this.equipamentosRepository.find({
      relations: ['curso', 'local'],
    });
  }
}
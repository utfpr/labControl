import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Local } from '../entities/local.entity';
import { CriarLocalDto } from './dto/criar-local.dto';

@Injectable()
export class LocaisService {
  constructor(
    @InjectRepository(Local)
    private locaisRepository: Repository<Local>,
  ) {}

  async criar(dados: CriarLocalDto): Promise<Local> {
    const { cursoId, supervisorId, ...dadosLocal } = dados;

    const novoLocal = this.locaisRepository.create({
      ...dadosLocal,
      curso: { id: cursoId },
      supervisor: { id: supervisorId },
    });

    return await this.locaisRepository.save(novoLocal);
  }

  async listarTodos(): Promise<Local[]> {
    // Traz o local já preenchido com os dados do curso e do supervisor!
    return await this.locaisRepository.find({
      relations: ['curso', 'supervisor'],
    });
  }
}
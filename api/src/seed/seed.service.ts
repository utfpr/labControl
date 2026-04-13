import { Injectable, OnApplicationBootstrap, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Usuario } from '../modules/entities/usuario.entity';
import { Curso } from '../modules/entities/curso.entity';
import { Local } from '../modules/entities/local.entity';
import { Equipamento } from '../modules/entities/equipamento.entity';
import { UserRole } from '../common/enums';

@Injectable()
export class SeedService implements OnApplicationBootstrap {
  private readonly logger = new Logger('BancoDeDados-Seed');

  constructor(
    @InjectRepository(Usuario) private usuarioRepo: Repository<Usuario>,
    @InjectRepository(Curso) private cursoRepo: Repository<Curso>,
    @InjectRepository(Local) private localRepo: Repository<Local>,
    @InjectRepository(Equipamento) private equipamentoRepo: Repository<Equipamento>,
  ) {}

  // Este método roda automaticamente assim que o NestJS liga
  async onApplicationBootstrap() {
    const totalUsuarios = await this.usuarioRepo.count();

    // Se já tiver usuários, significa que o banco não está vazio. Interrompe o seed.
    if (totalUsuarios > 0) {
      this.logger.log('O banco de dados já possui dados. Seed ignorado.');
      return;
    }

    this.logger.log('Banco vazio detectado! Plantando os dados de teste...');

    // 1. Criar Cursos
    const curso1 = await this.cursoRepo.save(this.cursoRepo.create({ 
      nome: 'Engenharia de Software',
      coordenador: 'Prof. Professor A'
    }));
    
    const curso2 = await this.cursoRepo.save(this.cursoRepo.create({ 
      nome: 'Ciência da Computação',
      coordenador: 'Profa. Professor B'
    }));

    // 2. Criar Usuários com diferentes níveis e STATUS
    await this.usuarioRepo.save(this.usuarioRepo.create({
      nome: 'Administrador Supremo',
      ra: 'admin001',
      email: 'admin@lab.com',
      senha: 'admin',
      role: UserRole.ADMIN,
      status: 'ATIVO',
      curso: curso1
    }));

    await this.usuarioRepo.save(this.usuarioRepo.create({
      nome: 'Supervisor de Laboratório',
      ra: 'sup001',
      email: 'supervisor@lab.com',
      senha: 'supervisor',
      role: UserRole.SUPERVISOR,
      status: 'ATIVO',
      curso: curso1
    }));

    await this.usuarioRepo.save(this.usuarioRepo.create({
      nome: 'Usuário Comum',
      ra: 'user001',
      email: 'user@lab.com',
      senha: 'user123',
      role: UserRole.COMUM,
      status: 'ATIVO',
      curso: curso2
    }));

    await this.usuarioRepo.save(this.usuarioRepo.create({
      nome: 'Usuário Cobaia',
      ra: 'user002',
      email: 'user002@lab.com',
      senha: 'user123',
      role: UserRole.COMUM,
      status: 'PENDENTE',
      curso: curso2
    }));

    // 3. Criar Locais (Salas/Laboratórios)
    const local1 = await this.localRepo.save(this.localRepo.create({ nome: 'Sala 1 - Lab. de Redes' }));
    const local2 = await this.localRepo.save(this.localRepo.create({ nome: 'Sala 2 - Lab. de Hardware' }));

    // 4. Criar Equipamentos atrelados aos Locais
    await this.equipamentoRepo.save(this.equipamentoRepo.create({
      nome: 'Osciloscópio Digital',
      patrimonio: 'EQP-001',
      local: local1
    }));

    await this.equipamentoRepo.save(this.equipamentoRepo.create({
      nome: 'Kit Arduino Mega',
      patrimonio: 'EQP-002',
      local: local2
    }));

    this.logger.log('🌱 Seed finalizado com sucesso! Dados básicos criados.');
  }
}
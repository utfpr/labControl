import { Injectable, OnApplicationBootstrap, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Usuario } from '../modules/entities/usuario.entity';
import { Curso } from '../modules/entities/curso.entity';
import { Local } from '../modules/entities/local.entity';
import { Equipamento } from '../modules/entities/equipamento.entity';
import { Disciplina } from '../modules/entities/disciplina.entity';
import { Aula } from '../modules/entities/aula.entity';
import { UserRole } from '../common/enums';

@Injectable()
export class SeedService implements OnApplicationBootstrap {
  private readonly logger = new Logger('BancoDeDados-Seed');

  constructor(
    @InjectRepository(Usuario) private usuarioRepo: Repository<Usuario>,
    @InjectRepository(Curso) private cursoRepo: Repository<Curso>,
    @InjectRepository(Local) private localRepo: Repository<Local>,
    @InjectRepository(Equipamento) private equipamentoRepo: Repository<Equipamento>,
    @InjectRepository(Disciplina) private disciplinaRepo: Repository<Disciplina>,
    @InjectRepository(Aula) private aulaRepo: Repository<Aula>,
  ) {}

  async onApplicationBootstrap() {
    const totalUsuarios = await this.usuarioRepo.count();

    if (totalUsuarios > 0) {
      this.logger.log('O banco de dados já possui dados. Seed ignorado.');
      return;
    }

    this.logger.log('Banco vazio detectado! Plantando dados de teste abrangentes...');

    // 1. Cursos (Computação)
    const cursosData = [
      { nome: 'Engenharia de Software', coordenador: 'Prof. software.coord@lab.com' },
      { nome: 'Ciência da Computação', coordenador: 'Prof. cs.coord@lab.com' },
      { nome: 'Sistemas de Informação', coordenador: 'Prof. si.coord@lab.com' },
    ];
    const cursos = await Promise.all(
      cursosData.map(c => this.cursoRepo.save(this.cursoRepo.create(c)))
    );

    // 2. Disciplinas (5 por curso)
    const disciplinasPorCurso = [
      ['Algoritmos I', 'Estrutura de Dados', 'Engenharia de Requisitos', 'Arquitetura de Software', 'Gestão de Projetos'],
      ['Cálculo I', 'Física I', 'Teoria da Computação', 'Sistemas Operacionais', 'Compiladores'],
      ['Banco de Dados I', 'Redes de Computadores', 'Análise de Sistemas', 'Governança de TI', 'Interface Homem-Máquina'],
    ];

    const allDisciplinas: Disciplina[] = [];
    for (let i = 0; i < cursos.length; i++) {
      const discData = disciplinasPorCurso[i].map(nome => ({
        nome,
        responsavel: null // Definiremos depois com um supervisor
      }));
      const savedDiscs = await Promise.all(
        discData.map(d => this.disciplinaRepo.save(this.disciplinaRepo.create(d)))
      );
      allDisciplinas.push(...savedDiscs);
    }

    // 3. Usuários
    const senhaPadrao = 'senha123';

    // Admin
    await this.usuarioRepo.save(this.usuarioRepo.create({
      nome: 'Administrador',
      ra: 'admin001',
      email: 'admin@lab.com',
      senha: senhaPadrao,
      role: UserRole.ADMIN,
      status: 'ATIVO',
      curso: cursos[0]
    }));

    // Supervisores (2)
    const supervisores = [];
    for (let i = 1; i <= 2; i++) {
      supervisores.push(await this.usuarioRepo.save(this.usuarioRepo.create({
        nome: `Supervisor ${i}`,
        ra: `sup00${i}`,
        email: `supervisor${i}@lab.com`,
        senha: senhaPadrao,
        role: UserRole.SUPERVISOR,
        status: 'ATIVO',
        curso: cursos[i % cursos.length]
      })));
    }

    // Alunos Ativos (5)
    const alunosAtivos = [];
    for (let i = 1; i <= 5; i++) {
      alunosAtivos.push(await this.usuarioRepo.save(this.usuarioRepo.create({
        nome: `Aluno Ativo ${i}`,
        ra: `aluno${i}`,
        email: `aluno${i}@lab.com`,
        senha: senhaPadrao,
        role: UserRole.COMUM,
        status: 'ATIVO',
        curso: cursos[i % cursos.length]
      })));
    }

    // Alunos Pendentes (2)
    const alunosPendentes = [];
    for (let i = 6; i <= 7; i++) {
      alunosPendentes.push(await this.usuarioRepo.save(this.usuarioRepo.create({
        nome: `Aluno Pendente ${i-5}`,
        ra: `aluno${i}`,
        email: `aluno${i}@lab.com`,
        senha: senhaPadrao,
        role: UserRole.COMUM,
        status: 'PENDENTE',
        curso: cursos[i % cursos.length]
      })));
    }

    // Vincular responsáveis às disciplinas (usando supervisores)
    for (let i = 0; i < allDisciplinas.length; i++) {
      const disc = allDisciplinas[i];
      disc.responsavel = supervisores[i % supervisores.length];
      await this.disciplinaRepo.save(disc);
    }

    // 4. Locais (3 Laboratórios)
    const locaisData = [
      { nome: 'Lab de Redes', descricao: 'Laboratório especializado em redes e telecomunicações' },
      { nome: 'Lab de Hardware', descricao: 'Laboratório de eletrônica e arquitetura de computadores' },
      { nome: 'Lab de Software', descricao: 'Laboratório focado em desenvolvimento de software' },
    ];
    const locais = await Promise.all(
      locaisData.map(l => this.localRepo.save(this.localRepo.create({
        ...l,
        supervisor: supervisores[0],
        curso: cursos[0]
      })))
    );

    // 5. Equipamentos (5 por local)
    for (let i = 0; i < locais.length; i++) {
      const local = locais[i];
      const eqps = [];
      for (let j = 1; j <= 5; j++) {
        eqps.push(this.equipamentoRepo.create({
          nome: `Equipamento ${j} - ${local.nome}`,
          patrimonio: `PAT-${local.id.slice(0,4)}-${j}`,
          marca: 'Marca Genérica',
          especificacao: 'Especificação técnica detalhada do equipamento de teste',
          local: local,
          curso: cursos[i]
        }));
      }
      await this.equipamentoRepo.save(eqps);
    }

    // 6. Aulas Alocadas (Exemplos durante a semana)
    // Dia da semana: 1 (Segunda) a 7 (Domingo)
    const aulasData = [
      { disciplina: allDisciplinas[0], local: locais[0], professor: supervisores[0], diaSemana: 1, horaInicio: '08:00:00', horaFim: '10:00:00', dataInicio: '2026-01-01', dataFim: '2026-06-30' },
      { disciplina: allDisciplinas[1], local: locais[0], professor: supervisores[0], diaSemana: 1, horaInicio: '10:00:00', horaFim: '12:00:00', dataInicio: '2026-01-01', dataFim: '2026-06-30' },
      { disciplina: allDisciplinas[5], local: locais[1], professor: supervisores[1], diaSemana: 2, horaInicio: '13:00:00', horaFim: '15:00:00', dataInicio: '2026-01-01', dataFim: '2026-06-30' },
      { disciplina: allDisciplinas[6], local: locais[1], professor: supervisores[1], diaSemana: 2, horaInicio: '15:00:00', horaFim: '17:00:00', dataInicio: '2026-01-01', dataFim: '2026-06-30' },
      { disciplina: allDisciplinas[10], local: locais[2], professor: supervisores[0], diaSemana: 3, horaInicio: '08:00:00', horaFim: '12:00:00', dataInicio: '2026-01-01', dataFim: '2026-06-30' },
      { disciplina: allDisciplinas[11], local: locais[2], professor: supervisores[1], diaSemana: 4, horaInicio: '18:00:00', horaFim: '22:00:00', dataInicio: '2026-01-01', dataFim: '2026-06-30' },
    ];

    await this.aulaRepo.save(
      aulasData.map(a => this.aulaRepo.create(a))
    );

    this.logger.log('🌱 Seed abrangente finalizado com sucesso!');
  }
}

import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { Usuario } from '../entities/usuario.entity';
import { Curso } from '../entities/curso.entity';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(Usuario)
    private usuarioRepository: Repository<Usuario>,
    @InjectRepository(Curso)
    private cursoRepository: Repository<Curso>,
    private jwtService: JwtService,
  ) {}

  async registrar(dados: any, caminhoComprovante?: string) {
    // 1. Verifica se email ou RA já estão em uso
    const usuarioExistente = await this.usuarioRepository.findOne({
      where: [{ email: dados.email }, { ra: dados.ra }],
    });

    if (usuarioExistente) {
      throw new BadRequestException('Email ou RA já estão cadastrados.');
    }

    // 2. Verifica se o curso escolhido existe
    const curso = await this.cursoRepository.findOneBy({ id: dados.cursoId });
    if (!curso) {
      throw new BadRequestException('Curso não encontrado.');
    }

    // 3. Salva o usuário (A senha será criptografada automaticamente pelo @BeforeInsert na Entidade)
    const novoUsuario = this.usuarioRepository.create({
      nome: dados.nome,
      ra: dados.ra,
      email: dados.email,
      senha: dados.senha, 
      comprovanteMatricula: caminhoComprovante,
      curso: { id: curso.id }, // Relacionamento
    } as unknown as Usuario);

    await this.usuarioRepository.save(novoUsuario);

    return {
      mensagem: 'Cadastro realizado com sucesso! Aguarde a aprovação de um administrador para fazer login.',
    };
  }

  async login(dados: any) {
    // 1. Busca o usuário pelo email
    const usuario = await this.usuarioRepository.findOne({ where: { email: dados.email } });
    if (!usuario) {
      throw new UnauthorizedException('Credenciais inválidas.');
    }

    // 2. Compara a senha digitada com o Hash do banco
    const senhaValida = await bcrypt.compare(dados.senha, usuario.senha);
    if (!senhaValida) {
      throw new UnauthorizedException('Credenciais inválidas.');
    }

    // 3. Verifica a trava de segurança (Aprovação do Admin)
    if (!usuario.ativo) {
      throw new UnauthorizedException('Acesso negado. Seu cadastro ainda está pendente de aprovação.');
    }

    // 4. Gera o Token JWT contendo a "identidade" do usuário
    const payload = { sub: usuario.id, email: usuario.email, role: usuario.role };

    return {
      access_token: this.jwtService.sign(payload),
      usuario: {
        id: usuario.id,
        nome: usuario.nome,
        role: usuario.role,
      }
    };
  }
}
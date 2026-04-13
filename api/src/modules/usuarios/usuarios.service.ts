import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Usuario } from '../entities/usuario.entity';

@Injectable()
export class UsuariosService {
  constructor(
    @InjectRepository(Usuario)
    private usuariosRepository: Repository<Usuario>,
  ) {}

  async registrar(dados: any, caminhoComprovante: string): Promise<Omit<Usuario, 'senha'>> {
    const usuarioExistente = await this.usuariosRepository.findOne({
      where: [{ email: dados.email }, { ra: dados.ra }]
    });
    if (usuarioExistente) throw new BadRequestException('Este e-mail ou RA já está em uso.');

    const novoUsuario = this.usuariosRepository.create({
      nome: dados.nome,
      email: dados.email,
      ra: dados.ra,
      senha: dados.senha, 
      comprovanteMatricula: caminhoComprovante,
      status: 'PENDENTE', // 👈 Nasce como pendente
    });

    if (dados.cursoId) novoUsuario.curso = { id: dados.cursoId } as any;

    const usuarioSalvo = await this.usuariosRepository.save(novoUsuario);
    delete usuarioSalvo.senha;
    return usuarioSalvo;
  }

  async listarPendentes(): Promise<Usuario[]> {
    return await this.usuariosRepository.find({
      where: { status: 'PENDENTE' }, // 👈 Busca apenas pendentes
      relations: ['curso'],
      order: { createdAt: 'ASC' }
    });
  }

  async listarTodos(): Promise<Usuario[]> {
    return await this.usuariosRepository.find({
      relations: ['curso'],
      order: { nome: 'ASC' }
    });
  }

  async aprovar(id: string): Promise<Omit<Usuario, 'senha'>> {
    const usuario = await this.usuariosRepository.findOneBy({ id });
    if (!usuario) throw new NotFoundException('Usuário não encontrado.');

    usuario.status = 'ATIVO'; // 👈 Muda para ATIVO
    const usuarioAprovado = await this.usuariosRepository.save(usuario);
    delete usuarioAprovado.senha;
    return usuarioAprovado;
  }

  async alternarStatus(id: string): Promise<Omit<Usuario, 'senha'>> {
    const usuario = await this.usuariosRepository.findOneBy({ id });
    if (!usuario) throw new NotFoundException('Usuário não encontrado.');

    // 👈 Alterna logicamente entre ATIVO e BLOQUEADO
    usuario.status = usuario.status === 'ATIVO' ? 'BLOQUEADO' : 'ATIVO';
    
    const usuarioAtualizado = await this.usuariosRepository.save(usuario);
    delete usuarioAtualizado.senha;
    return usuarioAtualizado;
  }

  async atualizar(id: string, dados: any): Promise<Omit<Usuario, 'senha'>> {
    const usuario = await this.usuariosRepository.findOneBy({ id });
    if (!usuario) throw new NotFoundException('Usuário não encontrado.');

    if (dados.nome) usuario.nome = dados.nome;
    if (dados.ra) usuario.ra = dados.ra;
    if (dados.role) usuario.role = dados.role;

    const usuarioAtualizado = await this.usuariosRepository.save(usuario);
    delete usuarioAtualizado.senha;
    return usuarioAtualizado;
  }

  async remover(id: string): Promise<void> {
    const usuario = await this.usuariosRepository.findOneBy({ id });
    if (!usuario) throw new NotFoundException('Usuário não encontrado.');
    await this.usuariosRepository.remove(usuario);
  }
}
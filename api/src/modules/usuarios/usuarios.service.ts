import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Usuario } from '../entities/usuario.entity';

@Injectable()
export class UsuariosService {
  constructor(
    @InjectRepository(Usuario)
    private usuarioRepository: Repository<Usuario>,
  ) {}

  // 👇 Rota 1: Traz apenas os inativos (Fila de espera)
  async listarPendentes(): Promise<Partial<Usuario>[]> {
    return await this.usuarioRepository.find({
      where: { ativo: false },
      // Segurança: Filtramos para não devolver a senha para o front-end
      select: ['id', 'nome', 'email', 'ra', 'role', 'comprovanteMatricula', 'createdAt'],
      relations: ['curso'], // Traz os dados do curso que a pessoa escolheu
    });
  }

  // 👇 Rota 2: Vira a chave "ativo" para true
  async aprovar(id: string): Promise<{ mensagem: string }> {
    const usuario = await this.usuarioRepository.findOneBy({ id });
    
    if (!usuario) {
      throw new NotFoundException('Usuário não encontrado.');
    }

    if (usuario.ativo) {
      return { mensagem: 'Este usuário já está aprovado.' };
    }

    usuario.ativo = true;
    await this.usuarioRepository.save(usuario);

    return { mensagem: `Usuário ${usuario.nome} aprovado com sucesso e liberado para login!` };
  }
}
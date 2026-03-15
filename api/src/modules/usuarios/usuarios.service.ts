import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Usuario } from '../entities/usuario.entity';
import { CriarUsuarioDto } from './dto/criar-usuario.dto';

@Injectable()
export class UsuariosService {
  constructor(
    @InjectRepository(Usuario)
    private usuariosRepository: Repository<Usuario>,
  ) {}

  async criar(dados: CriarUsuarioDto): Promise<Usuario> {
    // Extraímos o cursoId e guardamos o resto das propriedades em dadosUsuario
    const { cursoId, ...dadosUsuario } = dados;

    // O TypeORM entende que passar { id: cursoId } na propriedade 'curso'
    // fará a ligação correta da chave estrangeira (curso_id) no banco
    const novoUsuario = this.usuariosRepository.create({
      ...dadosUsuario,
      curso: { id: cursoId },
    });

    return await this.usuariosRepository.save(novoUsuario);
  }

  async listarTodos(): Promise<Usuario[]> {
    // O relations avisa o TypeORM para trazer os dados da tabela Cursos junto
    return await this.usuariosRepository.find({
      relations: ['curso'],
    });
  }
}
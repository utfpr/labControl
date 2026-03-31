import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { CursosService } from './cursos.service';
import { CriarCursoDto } from './dto/criar-curso.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../../common/enums';

@ApiTags('Cursos')
@ApiBearerAuth() // 👈 Avisa o Swagger que este Controller inteiro exige o Cadeado
@UseGuards(JwtAuthGuard, RolesGuard) // 👈 Coloca os dois guarda-costas na porta do Controller
@Controller('cursos')
export class CursosController {
  constructor(private readonly cursosService: CursosService) {}

  @Post()
  @Roles(UserRole.ADMIN) // 👈 ETIQUETA: Apenas Admins podem executar o POST!
  @ApiOperation({ summary: 'Cria um novo curso (Apenas Admin)' })
  async criar(@Body() dados: CriarCursoDto) {
    return this.cursosService.criar(dados);
  }

  @Get()
  // 👈 Como não tem a etiqueta @Roles aqui, qualquer usuário logado com token válido pode dar GET
  @ApiOperation({ summary: 'Lista todos os cursos (Requer Login)' })
  async listarTodos() {
    return this.cursosService.listarTodos();
  }
}
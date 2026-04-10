import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { CursosService } from './cursos.service';
import { CriarCursoDto } from './dto/criar-curso.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../../common/enums';

@ApiTags('Cursos')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('cursos')
export class CursosController {
  constructor(private readonly cursosService: CursosService) {}

  @Post()
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Cria um novo curso (Apenas Admin)' })
  async criar(@Body() dados: CriarCursoDto) {
    return this.cursosService.criar(dados);
  }

  @Get()
  @ApiOperation({ summary: 'Lista todos os cursos (Requer Login)' })
  async listarTodos() {
    return this.cursosService.listarTodos();
  }
}
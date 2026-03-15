import { Controller, Get, Post, Body } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBody } from '@nestjs/swagger';
import { CursosService } from './cursos.service';
import { CriarCursoDto } from './dto/criar-curso.dto';

@ApiTags('Cursos')
@Controller('cursos')
export class CursosController {
  constructor(private readonly cursosService: CursosService) {}

  @Post()
  @ApiOperation({ summary: 'Cria um novo curso' })
  @ApiBody({ type: CriarCursoDto })
  async criar(@Body() dados: CriarCursoDto) {
    return this.cursosService.criar(dados);
  }

  @Get()
  @ApiOperation({ summary: 'Lista todos os cursos' })
  async listarTodos() {
    return this.cursosService.listarTodos();
  }
}
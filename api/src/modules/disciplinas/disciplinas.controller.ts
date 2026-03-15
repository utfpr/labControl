import { Controller, Get, Post, Body } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBody } from '@nestjs/swagger';
import { DisciplinasService } from './disciplinas.service';
import { CriarDisciplinaDto } from './dto/criar-disciplina.dto';

@ApiTags('Disciplinas')
@Controller('disciplinas')
export class DisciplinasController {
  constructor(private readonly disciplinasService: DisciplinasService) {}

  @Post()
  @ApiOperation({ summary: 'Cadastra uma nova disciplina' })
  @ApiBody({ type: CriarDisciplinaDto })
  async criar(@Body() dados: CriarDisciplinaDto) {
    return this.disciplinasService.criar(dados);
  }

  @Get()
  @ApiOperation({ summary: 'Lista todas as disciplinas' })
  async listarTodas() {
    return this.disciplinasService.listarTodas();
  }
}
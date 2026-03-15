import { Controller, Get, Post, Body } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBody } from '@nestjs/swagger';
import { AulasService } from './aulas.service';
import { CriarAulaDto } from './dto/criar-aula.dto';

@ApiTags('Aulas')
@Controller('aulas')
export class AulasController {
  constructor(private readonly aulasService: AulasService) {}

  @Post()
  @ApiOperation({ summary: 'Cadastra uma nova aula no calendário' })
  @ApiBody({ type: CriarAulaDto })
  async criar(@Body() dados: CriarAulaDto) {
    return this.aulasService.criar(dados);
  }

  @Get()
  @ApiOperation({ summary: 'Lista todas as aulas cadastradas' })
  async listarTodas() {
    return this.aulasService.listarTodas();
  }
}
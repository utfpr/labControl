import { Controller, Get, Post, Body } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBody } from '@nestjs/swagger';
import { EquipamentosService } from './equipamentos.service';
import { CriarEquipamentoDto } from './dto/criar-equipamento.dto';

@ApiTags('Equipamentos')
@Controller('equipamentos')
export class EquipamentosController {
  constructor(private readonly equipamentosService: EquipamentosService) {}

  @Post()
  @ApiOperation({ summary: 'Cadastra um novo equipamento' })
  @ApiBody({ type: CriarEquipamentoDto })
  async criar(@Body() dados: CriarEquipamentoDto) {
    return this.equipamentosService.criar(dados);
  }

  @Get()
  @ApiOperation({ summary: 'Lista todos os equipamentos' })
  async listarTodos() {
    return this.equipamentosService.listarTodos();
  }
}
import { Controller, Get, Post, Body } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBody } from '@nestjs/swagger';
import { ReservasEquipamentosService } from './reservas-equipamentos.service';
import { CriarReservaEquipamentoDto } from './dto/criar-reserva-equipamento.dto';
import { ReservaEquipamento } from '../entities/reserva.equipamento.entity';

@ApiTags('Reservas de Equipamentos')
@Controller('reservas-equipamentos')
export class ReservasEquipamentosController {
  constructor(private readonly reservasEquipamentosService: ReservasEquipamentosService) {}

  @Post()
  @ApiOperation({ summary: 'Cria uma nova solicitação de reserva de equipamento' })
  @ApiBody({ type: CriarReservaEquipamentoDto }) // 👈 Devolvemos a instrução pro Swagger
  async criar(@Body() dados: CriarReservaEquipamentoDto): Promise<ReservaEquipamento> {
    return this.reservasEquipamentosService.criar(dados);
  }

  @Get()
  @ApiOperation({ summary: 'Lista todas as reservas de equipamentos' })
  async listarTodas(): Promise<ReservaEquipamento[]> {
    return this.reservasEquipamentosService.listarTodas();
  }
}
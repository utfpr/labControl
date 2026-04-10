import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ReservasEquipamentosService } from './reservas-equipamentos.service';
import { CriarReservaEquipamentoDto } from './dto/criar-reserva-equipamento.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Reservas de Equipamentos')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('reservas-equipamentos')
export class ReservasEquipamentosController {
  constructor(private readonly reservasEquipamentosService: ReservasEquipamentosService) {}

  @Post()
  @ApiOperation({ summary: 'Cria uma nova solicitação de reserva de equipamento (Requer Login)' })
  async criar(@Body() dados: CriarReservaEquipamentoDto) {
    return this.reservasEquipamentosService.criar(dados);
  }

  @Get()
  @ApiOperation({ summary: 'Lista todas as reservas de equipamentos (Requer Login)' })
  async listarTodas() {
    return this.reservasEquipamentosService.listarTodas();
  }
}
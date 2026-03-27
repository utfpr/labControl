import { Controller, Get, Post, Body } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBody } from '@nestjs/swagger';
import { ReservasLocaisService } from './reservas-locais.service';
import { CriarReservaLocalDto } from './dto/criar-reserva-local.dto';
import { ReservaLocal } from '../entities/reserva.local.entity';

@ApiTags('Reservas de Locais')
@Controller('reservas-locais')
export class ReservasLocaisController {
  constructor(private readonly reservasLocaisService: ReservasLocaisService) {}

  @Post()
  @ApiOperation({ summary: 'Cria uma nova solicitação de reserva de local' })
  @ApiBody({ type: CriarReservaLocalDto }) // 👈 Devolvemos a instrução pro Swagger
  async criar(@Body() dados: CriarReservaLocalDto): Promise<ReservaLocal> {
    return this.reservasLocaisService.criar(dados);
  }

  @Get()
  @ApiOperation({ summary: 'Lista todas as reservas de locais' })
  async listarTodas(): Promise<ReservaLocal[]> {
    return this.reservasLocaisService.listarTodas();
  }
}
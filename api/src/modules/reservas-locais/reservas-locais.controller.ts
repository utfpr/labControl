import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ReservasLocaisService } from './reservas-locais.service';
import { CriarReservaLocalDto } from './dto/criar-reserva-local.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Reservas de Locais')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('reservas-locais')
export class ReservasLocaisController {
  constructor(private readonly reservasLocaisService: ReservasLocaisService) {}

  @Post()
  @ApiOperation({ summary: 'Cria uma nova solicitação de reserva de local (Requer Login)' })
  async criar(@Body() dados: CriarReservaLocalDto) {
    return this.reservasLocaisService.criar(dados);
  }

  @Get()
  @ApiOperation({ summary: 'Lista todas as reservas de locais (Requer Login)' })
  async listarTodas() {
    return this.reservasLocaisService.listarTodas();
  }
}
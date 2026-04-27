import { Controller, Get, Post, Body, Patch, Param, UseGuards, Req, Query, BadRequestException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ReservasLocaisService } from './reservas-locais.service';
import { CriarReservaLocalDto } from './dto/criar-reserva-local.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../../common/enums';

@ApiTags('Reservas de Locais')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('reservas-locais')
export class ReservasLocaisController {
  constructor(private readonly reservasLocaisService: ReservasLocaisService) {}

  @Post()
  @ApiOperation({ summary: 'Cria uma nova solicitação de reserva de local' })
  async criar(@Body() dados: CriarReservaLocalDto, @Req() req: any) {
    // Garante que o solicitante seja quem está logado, caso não venha no body
    const solicitanteId = dados.solicitanteId || req.user.sub;
    return this.reservasLocaisService.criar({ ...dados, solicitanteId });
  }

  @Get()
  @Roles(UserRole.ADMIN, UserRole.SUPERVISOR)
  @ApiOperation({ summary: 'Lista todas as reservas de locais (Apenas Gestores)' })
  async listarTodas() {
    return this.reservasLocaisService.listarTodas();
  }

  @Get('minhas')
  @ApiOperation({ summary: 'Lista as reservas de local do utilizador logado' })
  async listarMinhasReservas(@Req() req: any) {
    return this.reservasLocaisService.listarMinhasReservas(req.user.sub);
  }

  @Patch(':id/aprovar')
  @Roles(UserRole.ADMIN, UserRole.SUPERVISOR)
  @ApiOperation({ summary: 'Aprova uma reserva de local pendente' })
  async aprovar(@Param('id') id: string, @Req() req: any) {
    return this.reservasLocaisService.aprovar(id, req.user.sub);
  }

  @Patch(':id/rejeitar')
  @Roles(UserRole.ADMIN, UserRole.SUPERVISOR)
  @ApiOperation({ summary: 'Rejeita uma reserva de local pendente' })
  async rejeitar(@Param('id') id: string, @Req() req: any) {
    return this.reservasLocaisService.rejeitar(id, req.user.sub);
  }

  @Patch(':id/cancelar')
  @ApiOperation({ summary: 'Cancela a reserva de local (Pode ser feito pelo solicitante)' })
  async cancelar(@Param('id') id: string, @Req() req: any) {
    return this.reservasLocaisService.cancelar(id, req.user.sub, req.user.sub);
  }

  @Patch(':id/finalizar')
  @Roles(UserRole.ADMIN, UserRole.SUPERVISOR)
  @ApiOperation({ summary: 'Marca a reserva de local como finalizada' })
  async finalizar(@Param('id') id: string, @Req() req: any) {
    return this.reservasLocaisService.finalizar(id, req.user.sub);
  }

  @Get(':id/historico')
  @Roles(UserRole.ADMIN, UserRole.SUPERVISOR)
  @ApiOperation({ summary: 'Consulta o histórico de status de uma reserva de local' })
  async getHistorico(@Param('id') id: string) {
    return this.reservasLocaisService.getHistoricoPorReserva(id);
  }

  @Get('stats')
  @ApiOperation({ summary: 'Retorna estatísticas de contagem por status' })
  async getStats() {
    return this.reservasLocaisService.countByStatus();
  }

  @Get('agenda')
  @ApiOperation({ summary: 'Busca reservas para uma data específica' })
  async getAgenda(@Query('date') date: string) {
    if (!date) throw new BadRequestException('A data é obrigatória (YYYY-MM-DD).');
    return this.reservasLocaisService.buscarPorData(date);
  }
}
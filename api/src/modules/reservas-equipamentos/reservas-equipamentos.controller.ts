import { Controller, Get, Post, Body, Patch, Param, UseGuards, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ReservasEquipamentosService } from './reservas-equipamentos.service';
import { CriarReservaEquipamentoDto } from './dto/criar-reserva-equipamento.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../../common/enums';

@ApiTags('Reservas de Equipamentos')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('reservas-equipamentos')
export class ReservasEquipamentosController {
  constructor(private readonly reservasEquipamentosService: ReservasEquipamentosService) {}

  @Post()
  @ApiOperation({ summary: 'Cria uma nova solicitação de reserva de equipamento' })
  async criar(@Body() dados: CriarReservaEquipamentoDto, @Req() req: any) {
    // Caso o front não envie o ID, pegamos do Token JWT por segurança
    const solicitanteId = dados.solicitanteId || req.user.sub;
    return this.reservasEquipamentosService.criar({ ...dados, solicitanteId });
  }

  @Get()
  @Roles(UserRole.ADMIN, UserRole.SUPERVISOR)
  @ApiOperation({ summary: 'Lista todas as reservas (Apenas Gestores)' })
  async listarTodas() {
    return this.reservasEquipamentosService.listarTodas();
  }

  @Get('minhas')
  @ApiOperation({ summary: 'Lista as reservas do utilizador logado' })
  async listarMinhasReservas(@Req() req: any) {
    // req.user.sub contém o ID do utilizador inserido pelo JWT Guard
    return this.reservasEquipamentosService.listarMinhasReservas(req.user.sub);
  }

  @Patch(':id/aprovar')
  @Roles(UserRole.ADMIN, UserRole.SUPERVISOR)
  @ApiOperation({ summary: 'Aprova uma reserva pendente' })
  async aprovar(@Param('id') id: string, @Req() req: any) {
    return this.reservasEquipamentosService.aprovar(id, req.user.sub);
  }

  @Patch(':id/rejeitar')
  @Roles(UserRole.ADMIN, UserRole.SUPERVISOR)
  @ApiOperation({ summary: 'Rejeita uma reserva pendente' })
  async rejeitar(@Param('id') id: string, @Req() req: any) {
    return this.reservasEquipamentosService.rejeitar(id, req.user.sub);
  }

  @Patch(':id/cancelar')
  @ApiOperation({ summary: 'Cancela a reserva (Pode ser feito pelo próprio utilizador)' })
  async cancelar(@Param('id') id: string, @Req() req: any) {
    return this.reservasEquipamentosService.cancelar(id, req.user.sub, req.user.sub);
  }

  @Patch(':id/finalizar')
  @Roles(UserRole.ADMIN, UserRole.SUPERVISOR)
  @ApiOperation({ summary: 'Marca a reserva como concluída/devolvida' })
  async finalizar(@Param('id') id: string, @Req() req: any) {
    return this.reservasEquipamentosService.finalizar(id, req.user.sub);
  }

  @Get(':id/historico')
  @Roles(UserRole.ADMIN, UserRole.SUPERVISOR)
  @ApiOperation({ summary: 'Consulta o histórico de status de uma reserva de equipamento' })
  async getHistorico(@Param('id') id: string) {
    return this.reservasEquipamentosService.getHistoricoPorReserva(id);
  }
}
import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBody, ApiBearerAuth } from '@nestjs/swagger';
import { AulasService } from './aulas.service';
import { CriarAulaDto } from './dto/criar-aula.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../../common/enums';

@ApiTags('Aulas')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('aulas')
export class AulasController {
  constructor(private readonly aulasService: AulasService) {}

  @Post()
  @Roles(UserRole.ADMIN, UserRole.SUPERVISOR) // Apenas gestores podem cadastrar aulas
  @ApiOperation({ summary: 'Cadastra uma nova aula no calendário (Gestores)' })
  @ApiBody({ type: CriarAulaDto })
  async criar(@Body() dados: CriarAulaDto) {
    return this.aulasService.criar(dados);
  }

  @Get()
  @ApiOperation({ summary: 'Lista todas as aulas cadastradas (Requer Login)' })
  async listarTodas() {
    return this.aulasService.listarTodas();
  }

  @Get('stats')
  @ApiOperation({ summary: 'Retorna estatísticas de contagem de aulas' })
  async getStats() {
    return this.aulasService.countByStatus();
  }
}
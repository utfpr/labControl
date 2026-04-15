import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBody, ApiBearerAuth } from '@nestjs/swagger';
import { DisciplinasService } from './disciplinas.service';
import { CriarDisciplinaDto } from './dto/criar-disciplina.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../../common/enums';

@ApiTags('Disciplinas')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('disciplinas')
export class DisciplinasController {
  constructor(private readonly disciplinasService: DisciplinasService) {}

  @Post()
  @Roles(UserRole.ADMIN, UserRole.SUPERVISOR) // Apenas gestores criam disciplinas
  @ApiOperation({ summary: 'Cadastra uma nova disciplina (Gestores)' })
  @ApiBody({ type: CriarDisciplinaDto })
  async criar(@Body() dados: CriarDisciplinaDto) {
    return this.disciplinasService.criar(dados);
  }

  @Get()
  @ApiOperation({ summary: 'Lista todas as disciplinas (Requer Login)' })
  async listarTodas() {
    return this.disciplinasService.listarTodas();
  }
}
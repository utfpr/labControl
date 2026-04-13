import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { CursosService } from './cursos.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../../common/enums';

@ApiTags('Cursos')
// ❌ REMOVA O @UseGuards E O @ApiBearerAuth DAQUI DE CIMA!
@Controller('cursos')
export class CursosController {
  constructor(private readonly cursosService: CursosService) {}

  @Post()
  @ApiBearerAuth() // 👈 Coloque a proteção apenas aqui
  @UseGuards(JwtAuthGuard, RolesGuard) // 👈 Coloque a proteção apenas aqui
  @Roles(UserRole.ADMIN, UserRole.SUPERVISOR)
  @ApiOperation({ summary: 'Cria um novo curso' })
  async criar(@Body() dados: any) {
    return this.cursosService.criar(dados);
  }

  // 👇 Esta rota agora está 100% livre para a tela de Registro!
  @Get()
  @ApiOperation({ summary: 'Lista todos os cursos (Público)' })
  async listarTodos() {
    return this.cursosService.listarTodos();
  }

  @Patch(':id')
  @ApiBearerAuth() // 👈 Coloque a proteção apenas aqui
  @UseGuards(JwtAuthGuard, RolesGuard) // 👈 Coloque a proteção apenas aqui
  @Roles(UserRole.ADMIN, UserRole.SUPERVISOR)
  @ApiOperation({ summary: 'Edita um curso existente' })
  async atualizar(@Param('id') id: string, @Body() dados: any) {
    return this.cursosService.atualizar(id, dados);
  }

  @Delete(':id')
  @ApiBearerAuth() // 👈 Coloque a proteção apenas aqui
  @UseGuards(JwtAuthGuard, RolesGuard) // 👈 Coloque a proteção apenas aqui
  @Roles(UserRole.ADMIN, UserRole.SUPERVISOR)
  @ApiOperation({ summary: 'Remove um curso' })
  async remover(@Param('id') id: string) {
    return this.cursosService.remover(id);
  }
}
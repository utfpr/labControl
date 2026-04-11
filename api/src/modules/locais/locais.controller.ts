import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { LocaisService } from './locais.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../../common/enums';

@ApiTags('Locais')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('locais')
export class LocaisController {
  constructor(private readonly locaisService: LocaisService) {}

  @Post()
  @Roles(UserRole.ADMIN, UserRole.SUPERVISOR)
  @ApiOperation({ summary: 'Cria um novo local/laboratório' })
  async criar(@Body() dados: any) {
    return this.locaisService.criar(dados);
  }

  @Get()
  @ApiOperation({ summary: 'Lista todos os locais' })
  async listarTodos() {
    return this.locaisService.listarTodos();
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN, UserRole.SUPERVISOR)
  @ApiOperation({ summary: 'Edita um local existente' })
  async atualizar(@Param('id') id: string, @Body() dados: any) {
    return this.locaisService.atualizar(id, dados);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN, UserRole.SUPERVISOR)
  @ApiOperation({ summary: 'Remove um local' })
  async remover(@Param('id') id: string) {
    return this.locaisService.remover(id);
  }
}
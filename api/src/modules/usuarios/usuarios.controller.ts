import { Controller, Get, Patch, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiParam } from '@nestjs/swagger';
import { UsuariosService } from './usuarios.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../../common/enums';

@ApiTags('Usuários')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('usuarios')
export class UsuariosController {
  constructor(private readonly usuariosService: UsuariosService) {}

  @Get('pendentes')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Lista todos os usuários aguardando aprovação (Apenas Admin)' })
  async listarPendentes() {
    return this.usuariosService.listarPendentes();
  }

  @Patch(':id/aprovar')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Aprova o cadastro de um usuário (Apenas Admin)' })
  @ApiParam({ name: 'id', description: 'ID do Usuário que será aprovado' })
  async aprovar(@Param('id') id: string) {
    return this.usuariosService.aprovar(id);
  }
}
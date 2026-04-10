import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { LocaisService } from './locais.service';
import { CriarLocalDto } from './dto/criar-local.dto';
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
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Cria um novo local (Apenas Admin)' })
  async criar(@Body() dados: CriarLocalDto) {
    return this.locaisService.criar(dados);
  }

  @Get()
  @ApiOperation({ summary: 'Lista todos os locais (Requer Login)' })
  async listarTodos() {
    return this.locaisService.listarTodos();
  }
}
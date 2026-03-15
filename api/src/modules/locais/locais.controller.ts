import { Controller, Get, Post, Body } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBody } from '@nestjs/swagger';
import { LocaisService } from './locais.service';
import { CriarLocalDto } from './dto/criar-local.dto';

@ApiTags('Locais')
@Controller('locais')
export class LocaisController {
  constructor(private readonly locaisService: LocaisService) {}

  @Post()
  @ApiOperation({ summary: 'Cria um novo local' })
  @ApiBody({ type: CriarLocalDto })
  async criar(@Body() dados: CriarLocalDto) {
    return this.locaisService.criar(dados);
  }

  @Get()
  @ApiOperation({ summary: 'Lista todos os locais' })
  async listarTodos() {
    return this.locaisService.listarTodos();
  }
}
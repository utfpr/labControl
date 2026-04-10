import { Controller, Get, Post, Body, Patch, Param, UseInterceptors, UploadedFile, BadRequestException, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiConsumes, ApiParam, ApiBody } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import * as fs from 'fs';
import { EquipamentosService } from './equipamentos.service';
import { CriarEquipamentoDto } from './dto/criar-equipamento.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../../common/enums';

@ApiTags('Equipamentos')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('equipamentos')
export class EquipamentosController {
  constructor(private readonly equipamentosService: EquipamentosService) {}

  @Post()
  @UseInterceptors(FileInterceptor('file'))
  @Roles(UserRole.ADMIN, UserRole.SUPERVISOR)
  @ApiOperation({ summary: 'Cria um novo equipamento (Admin/Supervisor)' })
  async criar(@Body() dados: CriarEquipamentoDto) {
    return this.equipamentosService.criar(dados);
  }

  @Get()
  @ApiOperation({ summary: 'Lista todos os equipamentos (Requer Login)' })
  async listarTodos() {
    return this.equipamentosService.listarTodos();
  }

  @Patch(':id/pop')
  @Roles(UserRole.ADMIN, UserRole.SUPERVISOR)
  @ApiOperation({ summary: 'Faz o upload do arquivo POP (PDF) de um equipamento' })
  @ApiParam({ name: 'id', description: 'ID do Equipamento' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: { type: 'object', properties: { arquivo: { type: 'string', format: 'binary' } } }
  })
  @UseInterceptors(
    FileInterceptor('arquivo', {
      storage: diskStorage({
        destination: (req, file, cb) => {
          const uploadPath = './uploads/pops';
          if (!fs.existsSync(uploadPath)) fs.mkdirSync(uploadPath, { recursive: true });
          cb(null, uploadPath);
        },
        filename: (req, file, cb) => {
          const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
          cb(null, `pop-${uniqueSuffix}${extname(file.originalname)}`);
        },
      }),
      fileFilter: (req, file, cb) => {
        if (file.mimetype === 'application/pdf') cb(null, true);
        else cb(new BadRequestException('Apenas PDFs!'), false);
      },
    }),
  )
  async uploadPop(@Param('id') id: string, @UploadedFile() file: any) {
    if (!file) throw new BadRequestException('Nenhum arquivo enviado.');
    return this.equipamentosService.atualizarPop(id, file.path);
  }
}
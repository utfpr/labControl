import { Controller, Get, Post, Body, Patch, Param, Delete, UseInterceptors, UploadedFile, BadRequestException, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiConsumes } from '@nestjs/swagger';
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

// 👇 Constantes de configuração preparadas para uso futuro com .env
const MAX_FILE_SIZE_MB = 5; // POPs podem ser maiores
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

const multerPdfConfig = {
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
  fileFilter: (req: any, file: any, cb: any) => {
    if (file.mimetype === 'application/pdf') cb(null, true);
    else cb(new BadRequestException('Apenas arquivos PDF são permitidos!'), false);
  },
  limits: {
    fileSize: MAX_FILE_SIZE_BYTES // Aplica a constante de 5MB
  }
};

@ApiTags('Equipamentos')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('equipamentos')
export class EquipamentosController {
  constructor(private readonly equipamentosService: EquipamentosService) { }

  @Post()
  @UseInterceptors(FileInterceptor('file', multerPdfConfig))
  @Roles(UserRole.ADMIN, UserRole.SUPERVISOR)
  @ApiOperation({ summary: 'Cria um novo equipamento (com POP opcional)' })
  @ApiConsumes('multipart/form-data')
  async criar(@Body() dados: CriarEquipamentoDto, @UploadedFile() file?: any) {
    return this.equipamentosService.criar(dados, file?.path);
  }

  @Get()
  @ApiOperation({ summary: 'Lista todos os equipamentos' })
  async listarTodos() {
    return this.equipamentosService.listarTodos();
  }

  @Patch(':id')
  @UseInterceptors(FileInterceptor('file', multerPdfConfig))
  @Roles(UserRole.ADMIN, UserRole.SUPERVISOR)
  @ApiOperation({ summary: 'Edita um equipamento existente e seu POP' })
  @ApiConsumes('multipart/form-data')
  async atualizar(
    @Param('id') id: string,
    @Body() dados: any, 
    @UploadedFile() file?: any
  ) {
    return this.equipamentosService.atualizar(id, dados, file?.path);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN, UserRole.SUPERVISOR)
  @ApiOperation({ summary: 'Remove um equipamento' })
  async remover(@Param('id') id: string) {
    return this.equipamentosService.remover(id);
  }

  @Patch(':id/pop')
  @Roles(UserRole.ADMIN, UserRole.SUPERVISOR)
  @UseInterceptors(FileInterceptor('arquivo', multerPdfConfig))
  async uploadPop(@Param('id') id: string, @UploadedFile() file: any) {
    if (!file) throw new BadRequestException('Nenhum arquivo enviado.');
    return this.equipamentosService.atualizarPop(id, file.path);
  }
}
import { Controller, Get, Post, Body, Patch, Param, Delete, UseInterceptors, UploadedFile, BadRequestException, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiConsumes, ApiBearerAuth } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import * as fs from 'fs';
import { UsuariosService } from './usuarios.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../../common/enums';

const multerComprovanteConfig = {
  // ... (mantenha sua configuração exata do multer aqui)
  storage: diskStorage({
    destination: (req, file, cb) => {
      const uploadPath = './uploads/comprovantes';
      if (!fs.existsSync(uploadPath)) fs.mkdirSync(uploadPath, { recursive: true });
      cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
      cb(null, `matricula-${uniqueSuffix}${extname(file.originalname)}`);
    },
  }),
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') cb(null, true);
    else cb(new BadRequestException('Apenas arquivos PDF são permitidos!'), false);
  },
};

@ApiTags('Usuários')
@Controller('usuarios')
export class UsuariosController {
  constructor(private readonly usuariosService: UsuariosService) {}

  @Post('registrar')
  @UseInterceptors(FileInterceptor('file', multerComprovanteConfig))
  @ApiOperation({ summary: 'Registra um novo usuário (Público)' })
  @ApiConsumes('multipart/form-data')
  async registrar(@Body() dados: any, @UploadedFile() file: any) {
    if (!file) throw new BadRequestException('O comprovante é obrigatório.');
    return this.usuariosService.registrar(dados, file.path);
  }

  @Get()
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPERVISOR)
  @ApiOperation({ summary: 'Lista TODOS os usuários cadastrados' })
  async listarTodos() {
    return this.usuariosService.listarTodos();
  }

  @Get('pendentes')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPERVISOR)
  @ApiOperation({ summary: 'Lista os usuários aguardando aprovação' })
  async listarPendentes() {
    return this.usuariosService.listarPendentes();
  }

  @Patch(':id/aprovar')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPERVISOR)
  @ApiOperation({ summary: 'Aprova o cadastro de um usuário' })
  async aprovar(@Param('id') id: string) {
    return this.usuariosService.aprovar(id);
  }

  @Patch(':id/status')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPERVISOR)
  @ApiOperation({ summary: 'Bloqueia ou desbloqueia o acesso de um usuário' })
  async alternarStatus(@Param('id') id: string) {
    return this.usuariosService.alternarStatus(id);
  }

  @Patch(':id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPERVISOR)
  @ApiOperation({ summary: 'Edita dados básicos do usuário' })
  async atualizar(@Param('id') id: string, @Body() dados: any) {
    return this.usuariosService.atualizar(id, dados);
  }

  @Delete(':id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPERVISOR)
  @ApiOperation({ summary: 'Remove um cadastro de usuário' })
  async remover(@Param('id') id: string) {
    return this.usuariosService.remover(id);
  }
}
import { Controller, Get, Post, Body, Patch, Param, UseInterceptors, UploadedFile, BadRequestException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBody, ApiConsumes, ApiParam } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import * as fs from 'fs';
import { EquipamentosService } from './equipamentos.service';
import { CriarEquipamentoDto } from './dto/criar-equipamento.dto';
import { Equipamento } from '../entities/equipamento.entity';

@ApiTags('Equipamentos')
@Controller('equipamentos')
export class EquipamentosController {
  constructor(private readonly equipamentosService: EquipamentosService) {}

  @Post()
  @ApiOperation({ summary: 'Cria um novo equipamento' })
  @ApiBody({ type: CriarEquipamentoDto })
  async criar(@Body() dados: CriarEquipamentoDto): Promise<Equipamento> {
    return this.equipamentosService.criar(dados);
  }

  @Get()
  @ApiOperation({ summary: 'Lista todos os equipamentos' })
  async listarTodos(): Promise<Equipamento[]> {
    return this.equipamentosService.listarTodos();
  }

  // 👇 NOVA ROTA DE UPLOAD DE PDF
  @Patch(':id/pop')
  @ApiOperation({ summary: 'Faz o upload do arquivo POP (PDF) de um equipamento' })
  @ApiParam({ name: 'id', description: 'ID do Equipamento' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        arquivo: {
          type: 'string',
          format: 'binary',
          description: 'Arquivo PDF do Procedimento Operacional Padrão',
        },
      },
    },
  })
  @UseInterceptors(
    FileInterceptor('arquivo', {
      storage: diskStorage({
        destination: (req, file, cb) => {
          const uploadPath = './uploads/pops';
          // Cria a pasta automaticamente se ela não existir
          if (!fs.existsSync(uploadPath)) {
            fs.mkdirSync(uploadPath, { recursive: true });
          }
          cb(null, uploadPath);
        },
        filename: (req, file, cb) => {
          // Gera um nome único para não sobrescrever arquivos com o mesmo nome
          const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
          cb(null, `pop-${uniqueSuffix}${extname(file.originalname)}`);
        },
      }),
      fileFilter: (req, file, cb) => {
        // Trava de segurança: Aceita APENAS PDFs
        if (file.mimetype === 'application/pdf') {
          cb(null, true);
        } else {
          cb(new BadRequestException('Apenas arquivos no formato PDF são permitidos!'), false);
        }
      },
    }),
  )
  async uploadPop(
    @Param('id') id: string,
    @UploadedFile() file: any,
  ) {
    if (!file) {
      throw new BadRequestException('Nenhum arquivo foi enviado.');
    }
    // Repassa o caminho salvo (ex: uploads/pops/pop-123.pdf) para o banco de dados
    return this.equipamentosService.atualizarPop(id, file.path);
  }
}
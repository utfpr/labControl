import { Controller, Post, Body, UseInterceptors, UploadedFile, BadRequestException, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiConsumes, ApiBody } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import * as fs from 'fs';
import { AuthService } from './auth.service';

@ApiTags('Autenticação')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('registro')
  @ApiOperation({ summary: 'Cadastra um novo usuário com comprovante de matrícula (PDF)' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        nome: { type: 'string', example: 'João da Silva' },
        ra: { type: 'string', example: 'a1234567' },
        email: { type: 'string', example: 'joao@aluno.edu.br' },
        senha: { type: 'string', example: 'senhaForte123' },
        cursoId: { type: 'string', format: 'uuid', description: 'ID do Curso' },
        comprovante: {
          type: 'string',
          format: 'binary',
          description: 'Comprovante de matrícula em PDF (Opcional para professores)',
        },
      },
    },
  })
  @UseInterceptors(
    FileInterceptor('comprovante', {
      storage: diskStorage({
        destination: (req, file, cb) => {
          const uploadPath = './uploads/comprovantes';
          if (!fs.existsSync(uploadPath)) {
            fs.mkdirSync(uploadPath, { recursive: true });
          }
          cb(null, uploadPath);
        },
        filename: (req, file, cb) => {
          const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
          cb(null, `matricula-${uniqueSuffix}${extname(file.originalname)}`);
        },
      }),
      fileFilter: (req, file, cb) => {
        if (file.mimetype === 'application/pdf') {
          cb(null, true);
        } else {
          cb(new BadRequestException('Apenas arquivos PDF são permitidos!'), false);
        }
      },
    }),
  )
  async registrar(
    @Body() dados: any,
    @UploadedFile() file: any,
  ) {
    return this.authService.registrar(dados, file?.path);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK) // Garante que retorne 200 OK ao invés de 201 Created
  @ApiOperation({ summary: 'Faz o login e retorna o Token JWT' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        email: { type: 'string', example: 'joao@aluno.edu.br' },
        senha: { type: 'string', example: 'senhaForte123' },
      }
    }
  })
  async login(@Body() dados: any) {
    return this.authService.login(dados);
  }
}
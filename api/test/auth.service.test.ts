import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from '../src/modules/auth/auth.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Usuario } from '../src/modules/entities/usuario.entity';
import { Curso } from '../src/modules/entities/curso.entity';
import { Repository } from 'typeorm';
import { UserRole } from '../src/common/enums';
import { BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

describe('AuthService', () => {
  let authService: AuthService;
  let usuarioRepo: Repository<Usuario>;
  let cursoRepo: Repository<Curso>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: getRepositoryToken(Usuario),
          useValue: {
            findOne: jest.fn(),
            create: jest.fn(),
            save: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(Curso),
          useValue: {
            findOneBy: jest.fn(),
          },
        },
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn(),
          },
        },
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);
    usuarioRepo = module.get(getRepositoryToken(Usuario));
    cursoRepo = module.get(getRepositoryToken(Curso));
  });

  describe('registrar', () => {
    const mockDados = {
      nome: 'Test User',
      ra: '12345',
      email: 'test@test.com',
      senha: 'password123',
      cursoId: 'some-uuid',
    };

    const mockCurso = { id: 'some-uuid', nome: 'Test Course' };

    beforeEach(() => {
      jest.clearAllMocks();
      (cursoRepo.findOneBy as jest.Mock).mockResolvedValue(mockCurso);
      (usuarioRepo.findOne as jest.Mock).mockResolvedValue(null);
    });

    it('should assign PROFESSOR role and allow missing comprovante when isDocente is true', async () => {
      const dados = { ...mockDados, isDocente: true };

      await authService.registrar(dados, undefined);

      expect(usuarioRepo.create).toHaveBeenCalledWith(expect.objectContaining({
        role: UserRole.PROFESSOR,
        comprovanteMatricula: undefined,
      }));
    });

    it('should assign COMUM role when isDocente is false or missing', async () => {
      const dados = { ...mockDados, isDocente: false };

      await authService.registrar(dados, 'path/to/pdf');

      expect(usuarioRepo.create).toHaveBeenCalledWith(expect.objectContaining({
        role: UserRole.COMUM,
      }));
    });

    it('should throw BadRequestException if isDocente is false and comprovanteMatricula is missing', async () => {
      const dados = { ...mockDados, isDocente: false };

      await expect(authService.registrar(dados, undefined))
        .rejects.toThrow(BadRequestException);
    });

    it('should allow registration if isDocente is false and comprovanteMatricula is provided', async () => {
      const dados = { ...mockDados, isDocente: false };

      await expect(authService.registrar(dados, 'path/to/pdf')).resolves.toBeDefined();
    });
  });
});

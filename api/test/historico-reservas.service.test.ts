import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { HistoricoReservasService } from '../src/modules/shared/historico-reservas.service';
import { BookingHistory } from '../src/modules/entities/booking-history.entity';
import { Status, ReservaTipo } from '../src/common/enums';
import { ReservaLocal } from '../src/modules/entities/reserva.local.entity';
import { ReservaEquipamento } from '../src/modules/entities/reserva.equipamento.entity';

describe('HistoricoReservasService', () => {
  let service: HistoricoReservasService;
  let historicoRepo: Repository<BookingHistory>;

  const mockBookingHistory = {
    id: 'hist-1',
    reservaId: 'reserva-1',
    tipoReserva: ReservaTipo.LOCAL,
    usuarioId: 'user-1',
    statusAntigo: Status.PENDENTE,
    statusNovo: Status.APROVADA,
    observacao: null,
    createdAt: new Date(),
    usuario: { id: 'user-1', nome: 'Test User' },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        HistoricoReservasService,
        {
          provide: getRepositoryToken(BookingHistory),
          useValue: {
            create: jest.fn((data) => ({ ...mockBookingHistory, ...data })),
            save: jest.fn().mockResolvedValue(mockBookingHistory),
            find: jest.fn().mockResolvedValue([mockBookingHistory]),
          },
        },
      ],
    }).compile();

    service = module.get<HistoricoReservasService>(HistoricoReservasService);
    historicoRepo = module.get<Repository<BookingHistory>>(getRepositoryToken(BookingHistory));
  });

  describe('criarRegistro', () => {
    it('deve criar um registro de histórico', async () => {
      const resultado = await service.criarRegistro(
        'reserva-1',
        ReservaTipo.LOCAL,
        'user-1',
        Status.PENDENTE,
        Status.APROVADA,
      );

      expect(resultado).toBeDefined();
      expect(historicoRepo.create).toHaveBeenCalledWith({
        reservaId: 'reserva-1',
        tipoReserva: ReservaTipo.LOCAL,
        usuarioId: 'user-1',
        statusAntigo: Status.PENDENTE,
        statusNovo: Status.APROVADA,
        observacao: null,
      });
      expect(historicoRepo.save).toHaveBeenCalled();
    });

    it('deve incluir a observacao quando fornecida', async () => {
      await service.criarRegistro(
        'reserva-1',
        ReservaTipo.LOCAL,
        'user-1',
        Status.PENDENTE,
        Status.APROVADA,
        'Teste de observação',
      );

      expect(historicoRepo.create).toHaveBeenCalledWith({
        reservaId: 'reserva-1',
        tipoReserva: ReservaTipo.LOCAL,
        usuarioId: 'user-1',
        statusAntigo: Status.PENDENTE,
        statusNovo: Status.APROVADA,
        observacao: 'Teste de observação',
      });
    });
  });

  describe('getHistoricoPorReserva', () => {
    it('deve retornar o histórico de uma reserva', async () => {
      const resultado = await service.getHistoricoPorReserva('reserva-1', ReservaTipo.LOCAL);

      expect(resultado).toEqual([mockBookingHistory]);
      expect(historicoRepo.find).toHaveBeenCalledWith({
        where: {
          reservaId: 'reserva-1',
          tipoReserva: ReservaTipo.LOCAL,
        },
        relations: ['usuario'],
        order: {
          createdAt: 'DESC',
        },
      });
    });
  });

  describe('validarTransicao', () => {
    it('deve permitir transicao PENDENTE -> APROVADA', async () => {
      await expect(service.validarTransicao(Status.PENDENTE, Status.APROVADA)).resolves.toBeUndefined();
    });

    it('deve permitir transicao PENDENTE -> REJEITADA', async () => {
      await expect(service.validarTransicao(Status.PENDENTE, Status.REJEITADA)).resolves.toBeUndefined();
    });

    it('deve permitir transicao PENDENTE -> CANCELADA', async () => {
      await expect(service.validarTransicao(Status.PENDENTE, Status.CANCELADA)).resolves.toBeUndefined();
    });

    it('deve permitir transicao APROVADA -> REJEITADA', async () => {
      await expect(service.validarTransicao(Status.APROVADA, Status.REJEITADA)).resolves.toBeUndefined();
    });

    it('deve permitir transicao APROVADA -> CANCELADA', async () => {
      await expect(service.validarTransicao(Status.APROVADA, Status.CANCELADA)).resolves.toBeUndefined();
    });

    it('deve permitir transicao APROVADA -> FINALIZADA', async () => {
      await expect(service.validarTransicao(Status.APROVADA, Status.FINALIZADA)).resolves.toBeUndefined();
    });

    it('deve permitir transicao REJEITADA -> PENDENTE', async () => {
      await expect(service.validarTransicao(Status.REJEITADA, Status.PENDENTE)).resolves.toBeUndefined();
    });

    it('deve lancar erro na transicao CANCELADA -> PENDENTE', async () => {
      await expect(service.validarTransicao(Status.CANCELADA, Status.PENDENTE)).rejects.toThrow(
        'Transição de status inválida de "cancelada" para "pendente".',
      );
    });

    it('deve lancar erro na transicao FINALIZADA -> APROVADA', async () => {
      await expect(service.validarTransicao(Status.FINALIZADA, Status.APROVADA)).rejects.toThrow(
        'Transição de status inválida de "finalizada" para "aprovada".',
      );
    });

    it('deve lancar erro na transicao APROVADA -> PENDENTE (não permitida)', async () => {
      await expect(service.validarTransicao(Status.APROVADA, Status.PENDENTE)).rejects.toThrow(
        'Transição de status inválida de "aprovada" para "pendente".',
      );
    });

    it('deve lancar erro na transicao PENDENTE -> FINALIZADA (não permitida)', async () => {
      await expect(service.validarTransicao(Status.PENDENTE, Status.FINALIZADA)).rejects.toThrow(
        'Transição de status inválida de "pendente" para "finalizada".',
      );
    });

    it('deve lancar erro na transicao REJEITADA -> APROVADA (não permitida)', async () => {
      await expect(service.validarTransicao(Status.REJEITADA, Status.APROVADA)).rejects.toThrow(
        'Transição de status inválida de "rejeitada" para "aprovada".',
      );
    });

    it('deve lancar erro na transicao CANCELADA -> APROVADA (não permitida)', async () => {
      await expect(service.validarTransicao(Status.CANCELADA, Status.APROVADA)).rejects.toThrow(
        'Transição de status inválida de "cancelada" para "aprovada".',
      );
    });

    it('deve lancar erro na transicao FINALIZADA -> REJEITADA (não permitida)', async () => {
      await expect(service.validarTransicao(Status.FINALIZADA, Status.REJEITADA)).rejects.toThrow(
        'Transição de status inválida de "finalizada" para "rejeitada".',
      );
    });

    it('deve lancar erro na transicao idêntica PENDENTE -> PENDENTE', async () => {
      await expect(service.validarTransicao(Status.PENDENTE, Status.PENDENTE)).rejects.toThrow(
        'Transição de status inválida de "pendente" para "pendente".',
      );
    });

    it('deve lancar erro na transicao idêntica APROVADA -> APROVADA', async () => {
      await expect(service.validarTransicao(Status.APROVADA, Status.APROVADA)).rejects.toThrow(
        'Transição de status inválida de "aprovada" para "aprovada".',
      );
    });
  });

  describe('validarTransicaoAprovacao', () => {
    it('deve permitir aprovacao quando status é PENDENTE', async () => {
      await expect(service.validarTransicaoAprovacao(Status.PENDENTE)).resolves.toBeUndefined();
    });

    it('deve lancar erro na aprovacao de status APROVADA', async () => {
      await expect(service.validarTransicaoAprovacao(Status.APROVADA)).rejects.toThrow(
        'Somente reservas com status "PENDENTE" podem ser aprovadas.',
      );
    });

    it('deve lancar erro na aprovacao de status REJEITADA', async () => {
      await expect(service.validarTransicaoAprovacao(Status.REJEITADA)).rejects.toThrow(
        'Somente reservas com status "PENDENTE" podem ser aprovadas.',
      );
    });

    it('deve lancar erro na aprovacao de status CANCELADA', async () => {
      await expect(service.validarTransicaoAprovacao(Status.CANCELADA)).rejects.toThrow(
        'Somente reservas com status "PENDENTE" podem ser aprovadas.',
      );
    });

    it('deve lancar erro na aprovacao de status FINALIZADA', async () => {
      await expect(service.validarTransicaoAprovacao(Status.FINALIZADA)).rejects.toThrow(
        'Somente reservas com status "PENDENTE" podem ser aprovadas.',
      );
    });
  });

  describe('validarTransicaoRejeicao', () => {
    it('deve permitir rejeicao de status PENDENTE', async () => {
      await expect(service.validarTransicaoRejeicao(Status.PENDENTE)).resolves.toBeUndefined();
    });

    it('deve permitir rejeicao de status APROVADA', async () => {
      await expect(service.validarTransicaoRejeicao(Status.APROVADA)).resolves.toBeUndefined();
    });

    it('deve lancar erro na rejeicao de status CANCELADA', async () => {
      await expect(service.validarTransicaoRejeicao(Status.CANCELADA)).rejects.toThrow(
        'Reservas "CANCELADAS" ou "FINALIZADAS" não podem ser rejeitadas.',
      );
    });

    it('deve lancar erro na rejeicao de status FINALIZADA', async () => {
      await expect(service.validarTransicaoRejeicao(Status.FINALIZADA)).rejects.toThrow(
        'Reservas "CANCELADAS" ou "FINALIZADAS" não podem ser rejeitadas.',
      );
    });
  });

  describe('validarTransicaoFinalizacao', () => {
    it('deve permitir finalizacao quando status é APROVADA', async () => {
      await expect(service.validarTransicaoFinalizacao(Status.APROVADA)).resolves.toBeUndefined();
    });

    it('deve lancar erro na finalizacao de status PENDENTE', async () => {
      await expect(service.validarTransicaoFinalizacao(Status.PENDENTE)).rejects.toThrow(
        'Somente reservas com status "APROVADA" podem ser finalizadas.',
      );
    });

    it('deve lancar erro na finalizacao de status REJEITADA', async () => {
      await expect(service.validarTransicaoFinalizacao(Status.REJEITADA)).rejects.toThrow(
        'Somente reservas com status "APROVADA" podem ser finalizadas.',
      );
    });

    it('deve lancar erro na finalizacao de status CANCELADA', async () => {
      await expect(service.validarTransicaoFinalizacao(Status.CANCELADA)).rejects.toThrow(
        'Somente reservas com status "APROVADA" podem ser finalizadas.',
      );
    });

    it('deve lancar erro na finalizacao de status FINALIZADA (já finalizada)', async () => {
      await expect(service.validarTransicaoFinalizacao(Status.FINALIZADA)).rejects.toThrow(
        'Somente reservas com status "APROVADA" podem ser finalizadas.',
      );
    });
  });

  describe('validarTransicaoCancelamentoUsuario', () => {
    const mockReservaLocal = {
      id: 'reserva-1',
      status: Status.PENDENTE,
      solicitante: { id: 'user-1' },
    } as unknown as ReservaLocal;

    const mockReservaEquip = {
      id: 'reserva-2',
      status: Status.APROVADA,
      solicitante: { id: 'user-1' },
    } as unknown as ReservaEquipamento;

    it('deve permitir cancelamento quando solicitante é o usuario', async () => {
      await expect(
        service.validarTransicaoCancelamentoUsuario(Status.PENDENTE, 'user-1', mockReservaLocal),
      ).resolves.toBeUndefined();
    });

    it('deve permitir cancelamento para equipamento quando solicitante é o usuario', async () => {
      await expect(
        service.validarTransicaoCancelamentoUsuario(Status.APROVADA, 'user-1', mockReservaEquip),
      ).resolves.toBeUndefined();
    });

    it('deve lancar erro quando solicitante NÃO é o usuario', async () => {
      const mockOutroSolicitante = {
        id: 'reserva-3',
        status: Status.PENDENTE,
        solicitante: { id: 'user-outro' },
      } as unknown as ReservaLocal;

      await expect(
        service.validarTransicaoCancelamentoUsuario(Status.PENDENTE, 'user-1', mockOutroSolicitante),
      ).rejects.toThrow('Apenas o solicitante pode cancelar esta reserva.');
    });

    it('deve lancar erro quando status é CANCELADA', async () => {
      const mockCancelada = {
        id: 'reserva-4',
        status: Status.CANCELADA,
        solicitante: { id: 'user-1' },
      } as unknown as ReservaLocal;

      await expect(
        service.validarTransicaoCancelamentoUsuario(Status.CANCELADA, 'user-1', mockCancelada),
      ).rejects.toThrow('Reservas "CANCELADAS" ou "FINALIZADAS" não podem ser canceladas.');
    });

    it('deve lancar erro quando status é FINALIZADA', async () => {
      const mockFinalizada = {
        id: 'reserva-5',
        status: Status.FINALIZADA,
        solicitante: { id: 'user-1' },
      } as unknown as ReservaLocal;

      await expect(
        service.validarTransicaoCancelamentoUsuario(Status.FINALIZADA, 'user-1', mockFinalizada),
      ).rejects.toThrow('Reservas "CANCELADAS" ou "FINALIZADAS" não podem ser canceladas.');
    });
  });
});

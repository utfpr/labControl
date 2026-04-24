import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { ConflitoReservasService } from '../src/modules/shared/conflito-reservas.service';
import { ReservaLocal } from '../src/modules/entities/reserva.local.entity';
import { ReservaEquipamento } from '../src/modules/entities/reserva.equipamento.entity';
import { Aula } from '../src/modules/entities/aula.entity';
import { Equipamento } from '../src/modules/entities/equipamento.entity';

/** Helper: cria uma data no timezone local com hora exata.
 *  O serviço usa toTimeString().split(' ')[0] (hora local), então
 *  os mocks precisam ter as mesmas horas que a query vai passar.
 */
function localDt(year: number, month: number, day: number, hour: number, min = 0, sec = 0) {
  return new Date(year, month, day, hour, min, sec);
}

/** Mock inteligente que filtra por local_id, status, data e dia_semana. */
function createQueryBuilderMock(
  result: any,
  // resultType: 'one' | 'many' = 'one',
) {
  const mock = {
    where: jest.fn().mockImplementation(function (this: any, ...args: any[]) {
      this._whereArgs = args;
      return this;
    }),
    andWhere: jest.fn().mockImplementation(function (this: any, ...args: any[]) {
      this._andWhereArgs = this._andWhereArgs || [];
      this._andWhereArgs.push(args);
      return this;
    }),
    _matchOne: function (item: any): boolean {
      const andWhereArgs: [string, any][] = this._andWhereArgs || [];
      const whereArgs: [string, any] | null = this._whereArgs || null;

      // where(local_id)
      if (whereArgs) {
        const [clause, params] = whereArgs;
        if (clause.includes('local_id')) {
          if (item.local_id !== params.localId) return false;
        }
      }

      for (const [clause, params] of andWhereArgs) {
        if (clause.includes('status IN')) {
          const statusValues = (params.status || []).map((s: string) => s.toLowerCase());
          const itemStatus = (item.status || '').toLowerCase();
          if (statusValues.length > 0 && !statusValues.includes(itemStatus)) return false;
        }
        if (clause.includes('data_inicio')) {
          if (item.data_inicio > params.data) return false;
        }
        if (clause.includes('data_fim')) {
          if (item.data_fim < params.data) return false;
        }
        if (clause.includes('dia_semana')) {
          if (item.dia_semana !== params.diaSemana) return false;
        }
        if (clause.includes('dataHoraInicio')) {
          if (item.dataHoraInicio >= params.fim) return false;
        }
        if (clause.includes('dataHoraFim')) {
          if (item.dataHoraFim <= params.inicio) return false;
        }
      }
      return true;
    },
    getOne: jest.fn().mockImplementation(function (this: any) {
      if (!result) return Promise.resolve(null);
      return Promise.resolve(this._matchOne(result) ? result : null);
    }),
    getMany: jest.fn().mockImplementation(function (this: any) {
      const arr = Array.isArray(result) ? result : [];
      return Promise.resolve(arr.filter((item: any) => this._matchOne(item)));
    }),
  };
  return mock;
}

describe('ConflitoReservasService', () => {
  let service: ConflitoReservasService;
  let reservasLocaisRepo: Repository<ReservaLocal>;
  let reservasEquipamentosRepo: Repository<ReservaEquipamento>;
  let aulasRepo: Repository<Aula>;
  let equipamentosRepo: Repository<Equipamento>;

  // Reserva de 10h-12h local, status aprovada, data valida, dia terca
  const mockReservaLocal = {
    id: '1',
    local_id: 'local-1',
    dataHoraInicio: localDt(2026, 4, 1, 10, 0, 0),
    dataHoraFim: localDt(2026, 4, 1, 12, 0, 0),
    status: 'aprovada',
    solicitante: null,
    local: null,
  };

  const mockReservaEquip = {
    id: 'eq-1',
    equipamento_id: 'equip-1',
    dataHoraInicio: localDt(2026, 4, 1, 10, 0, 0),
    dataHoraFim: localDt(2026, 4, 1, 12, 0, 0),
    status: 'pendente',
    solicitante: null,
    equipamento: null,
  };

  // Aula terca, data valida para 2026-05-05, hora 08-12 local
  const mockAula = {
    id: 'aula-1',
    local_id: 'local-1',
    data_inicio: '2026-04-01',
    data_fim: '2026-06-30',
    dia_semana: 2,
    horaInicio: '08:00:00',
    horaFim: '10:00:00',
  };

  const mockEquipamento = {
    id: 'equip-1',
    local_id: 'local-1',
    local: { id: 'local-1', nome: 'Lab A' },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ConflitoReservasService,
        { provide: getRepositoryToken(ReservaLocal), useValue: { createQueryBuilder: jest.fn() } },
        { provide: getRepositoryToken(ReservaEquipamento), useValue: { createQueryBuilder: jest.fn() } },
        { provide: getRepositoryToken(Aula), useValue: { createQueryBuilder: jest.fn() } },
        { provide: getRepositoryToken(Equipamento), useValue: { findOne: jest.fn() } },
        { provide: DataSource, useValue: {} },
      ],
    }).compile();

    service = module.get<ConflitoReservasService>(ConflitoReservasService);
    reservasLocaisRepo = module.get<Repository<ReservaLocal>>(getRepositoryToken(ReservaLocal));
    reservasEquipamentosRepo = module.get<Repository<ReservaEquipamento>>(getRepositoryToken(ReservaEquipamento));
    aulasRepo = module.get<Repository<Aula>>(getRepositoryToken(Aula));
    equipamentosRepo = module.get<Repository<Equipamento>>(getRepositoryToken(Equipamento));
  });

  describe('validateIntervaloDatas', () => {
    it('deve retornar null quando fim é após inicio', () => {
      const resultado = service.validateIntervaloDatas(
        localDt(2026, 4, 1, 10, 0, 0),
        localDt(2026, 4, 1, 12, 0, 0),
      );
      expect(resultado).toBeNull();
    });

    it('deve retornar erro quando inicio == fim (comparação >=)', () => {
      const data = localDt(2026, 4, 1, 10, 0, 0);
      const resultado = service.validateIntervaloDatas(data, data);
      expect(resultado).toBe('A data de início deve ser anterior à data de fim.');
    });

    it('deve retornar erro quando inicio é após fim', () => {
      const resultado = service.validateIntervaloDatas(
        localDt(2026, 4, 1, 12, 0, 0),
        localDt(2026, 4, 1, 10, 0, 0),
      );
      expect(resultado).toBe('A data de início deve ser anterior à data de fim.');
    });
  });

  describe('checkLocalReservaConflito', () => {
    it('deve retornar null quando não há conflitos', async () => {
      const mock = createQueryBuilderMock(null);
      (reservasLocaisRepo.createQueryBuilder as jest.Mock).mockReturnValue(mock);

      const resultado = await service.checkLocalReservaConflito(
        'local-1',
        localDt(2026, 5, 1, 14, 0, 0),
        localDt(2026, 5, 1, 16, 0, 0),
      );
      expect(resultado).toBeNull();
    });

    it('deve retornar erro quando há reserva pendente no mesmo horário', async () => {
      const mock = createQueryBuilderMock(mockReservaLocal);
      (reservasLocaisRepo.createQueryBuilder as jest.Mock).mockReturnValue(mock);

      const resultado = await service.checkLocalReservaConflito(
        'local-1',
        localDt(2026, 4, 1, 11, 0, 0),
        localDt(2026, 4, 1, 13, 0, 0),
      );
      expect(resultado).toBe('Este laboratório já possui uma reserva ativa para este horário.');
      expect(mock.where).toHaveBeenCalledWith('reserva.local_id = :localId', { localId: 'local-1' });
    });

    it('deve detectar sobreposição parcial no inicio', async () => {
      const mock = createQueryBuilderMock(mockReservaLocal);
      (reservasLocaisRepo.createQueryBuilder as jest.Mock).mockReturnValue(mock);

      const resultado = await service.checkLocalReservaConflito(
        'local-1',
        localDt(2026, 4, 1, 9, 0, 0),
        localDt(2026, 4, 1, 11, 0, 0),
      );
      expect(resultado).toBe('Este laboratório já possui uma reserva ativa para este horário.');
    });

    it('deve detectar sobreposição parcial no fim', async () => {
      const mock = createQueryBuilderMock(mockReservaLocal);
      (reservasLocaisRepo.createQueryBuilder as jest.Mock).mockReturnValue(mock);

      const resultado = await service.checkLocalReservaConflito(
        'local-1',
        localDt(2026, 4, 1, 11, 0, 0),
        localDt(2026, 4, 1, 13, 0, 0),
      );
      expect(resultado).toBe('Este laboratório já possui uma reserva ativa para este horário.');
    });

    it('deve retornar null quando nova reserva começa exatamente quando a existente termina (touch boundary)', async () => {
      const mock = createQueryBuilderMock(mockReservaLocal);
      (reservasLocaisRepo.createQueryBuilder as jest.Mock).mockReturnValue(mock);

      const resultado = await service.checkLocalReservaConflito(
        'local-1',
        localDt(2026, 4, 1, 12, 0, 0),
        localDt(2026, 4, 1, 14, 0, 0),
      );
      expect(resultado).toBeNull();
    });

    it('deve retornar null quando nova reserva termina exatamente quando a existente começa (touch boundary)', async () => {
      const mock = createQueryBuilderMock(mockReservaLocal);
      (reservasLocaisRepo.createQueryBuilder as jest.Mock).mockReturnValue(mock);

      const resultado = await service.checkLocalReservaConflito(
        'local-1',
        localDt(2026, 4, 1, 8, 0, 0),
        localDt(2026, 4, 1, 10, 0, 0),
      );
      expect(resultado).toBeNull();
    });

    it('deve detectar conflito quando nova reserva coincide exatamente com a existente', async () => {
      const mock = createQueryBuilderMock(mockReservaLocal);
      (reservasLocaisRepo.createQueryBuilder as jest.Mock).mockReturnValue(mock);

      const resultado = await service.checkLocalReservaConflito(
        'local-1',
        localDt(2026, 4, 1, 10, 0, 0),
        localDt(2026, 4, 1, 12, 0, 0),
      );
      expect(resultado).toBe('Este laboratório já possui uma reserva ativa para este horário.');
    });

    it('deve detectar conflito quando nova reserva engloba a existente (encompassing)', async () => {
      const mock = createQueryBuilderMock(mockReservaLocal);
      (reservasLocaisRepo.createQueryBuilder as jest.Mock).mockReturnValue(mock);

      const resultado = await service.checkLocalReservaConflito(
        'local-1',
        localDt(2026, 4, 1, 9, 0, 0),
        localDt(2026, 4, 1, 13, 0, 0),
      );
      expect(resultado).toBe('Este laboratório já possui uma reserva ativa para este horário.');
    });

    it('deve detectar conflito quando nova reserva está dentro da existente (inside)', async () => {
      const mock = createQueryBuilderMock(mockReservaLocal);
      (reservasLocaisRepo.createQueryBuilder as jest.Mock).mockReturnValue(mock);

      const resultado = await service.checkLocalReservaConflito(
        'local-1',
        localDt(2026, 4, 1, 10, 30, 0),
        localDt(2026, 4, 1, 11, 30, 0),
      );
      expect(resultado).toBe('Este laboratório já possui uma reserva ativa para este horário.');
    });

    it('deve retornar null quando nova reserva é inteiramente antes da existente', async () => {
      const mock = createQueryBuilderMock(null);
      (reservasLocaisRepo.createQueryBuilder as jest.Mock).mockReturnValue(mock);

      const resultado = await service.checkLocalReservaConflito(
        'local-1',
        localDt(2026, 4, 1, 8, 0, 0),
        localDt(2026, 4, 1, 9, 0, 0),
      );
      expect(resultado).toBeNull();
    });

    it('deve retornar null quando nova reserva é inteiramente após a existente', async () => {
      const mock = createQueryBuilderMock(null);
      (reservasLocaisRepo.createQueryBuilder as jest.Mock).mockReturnValue(mock);

      const resultado = await service.checkLocalReservaConflito(
        'local-1',
        localDt(2026, 4, 1, 13, 0, 0),
        localDt(2026, 4, 1, 14, 0, 0),
      );
      expect(resultado).toBeNull();
    });

    it('deve ignorar reservas com status CANCELADA (filtradas pelo serviço)', async () => {
      const mockReservaCancelada = { ...mockReservaLocal, status: 'cancelada' };
      const mock = createQueryBuilderMock(mockReservaCancelada);
      (reservasLocaisRepo.createQueryBuilder as jest.Mock).mockReturnValue(mock);

      const resultado = await service.checkLocalReservaConflito(
        'local-1',
        localDt(2026, 4, 1, 10, 30, 0),
        localDt(2026, 4, 1, 11, 30, 0),
      );
      expect(resultado).toBeNull();
    });
  });

  describe('checkGradeAulaConflito', () => {
    it('deve retornar null quando não há aulas no horário', async () => {
      const mock = createQueryBuilderMock([]);
      (aulasRepo.createQueryBuilder as jest.Mock).mockReturnValue(mock);

      const resultado = await service.checkGradeAulaConflito(
        'local-1',
        localDt(2026, 4, 5, 14, 0, 0),
        localDt(2026, 4, 5, 16, 0, 0),
      );
      expect(resultado).toBeNull();
    });

    it('deve retornar conflito quando há aula no mesmo horário', async () => {
      // 2026-05-05 (terca, dia_semana=2). mockAula tem dia_semana=2, data valida, hora 08-10.
      // Reserva 09-11 cruza com aula 08-10.
      const mock = createQueryBuilderMock([mockAula]);
      (aulasRepo.createQueryBuilder as jest.Mock).mockReturnValue(mock);

      const resultado = await service.checkGradeAulaConflito(
        'local-1',
        localDt(2026, 4, 5, 9, 0, 0),
        localDt(2026, 4, 5, 11, 0, 0),
      );
      expect(resultado).toContain('aula cadastrada');
    });

    it('deve retornar null quando aula termina antes da reserva', async () => {
      // Aula com horario 06-08, mas com data INVALIDA para 2026-05-05
      const aulaAntiga = {
        ...mockAula,
        horaInicio: '06:00:00',
        horaFim: '08:00:00',
        data_inicio: '2020-01-01',
        data_fim: '2020-01-31',
      };
      const mock = createQueryBuilderMock([aulaAntiga]);
      (aulasRepo.createQueryBuilder as jest.Mock).mockReturnValue(mock);

      const resultado = await service.checkGradeAulaConflito(
        'local-1',
        localDt(2026, 4, 5, 10, 0, 0),
        localDt(2026, 4, 5, 12, 0, 0),
      );
      expect(resultado).toBeNull();
    });

    it('deve detectar conflito quando aula engloba a reserva', async () => {
      // Aula 08-12, Reserva 09-11
      const aulaLarga = { ...mockAula, horaInicio: '08:00:00', horaFim: '12:00:00' };
      const mock = createQueryBuilderMock([aulaLarga]);
      (aulasRepo.createQueryBuilder as jest.Mock).mockReturnValue(mock);

      const resultado = await service.checkGradeAulaConflito(
        'local-1',
        localDt(2026, 4, 5, 9, 0, 0),
        localDt(2026, 4, 5, 11, 0, 0),
      );
      expect(resultado).toContain('aula cadastrada');
    });

    it('deve detectar conflito quando reserva engloba a aula', async () => {
      // Aula 09-10, Reserva 08-11
      const aulaCurta = { ...mockAula, horaInicio: '09:00:00', horaFim: '10:00:00' };
      const mock = createQueryBuilderMock([aulaCurta]);
      (aulasRepo.createQueryBuilder as jest.Mock).mockReturnValue(mock);

      const resultado = await service.checkGradeAulaConflito(
        'local-1',
        localDt(2026, 4, 5, 8, 0, 0),
        localDt(2026, 4, 5, 11, 0, 0),
      );
      expect(resultado).toContain('aula cadastrada');
    });

    it('deve retornar null quando reserva começa exatamente quando aula termina', async () => {
      // Aula 08-10, Reserva 10-12
      const mock = createQueryBuilderMock([mockAula]);
      (aulasRepo.createQueryBuilder as jest.Mock).mockReturnValue(mock);

      const resultado = await service.checkGradeAulaConflito(
        'local-1',
        localDt(2026, 4, 5, 10, 0, 0),
        localDt(2026, 4, 5, 12, 0, 0),
      );
      expect(resultado).toBeNull();
    });

    it('deve retornar null quando reserva termina exatamente quando aula começa', async () => {
      // Aula 08-10, Reserva 06-08
      const mock = createQueryBuilderMock([mockAula]);
      (aulasRepo.createQueryBuilder as jest.Mock).mockReturnValue(mock);

      const resultado = await service.checkGradeAulaConflito(
        'local-1',
        localDt(2026, 4, 5, 6, 0, 0),
        localDt(2026, 4, 5, 8, 0, 0),
      );
      expect(resultado).toBeNull();
    });

    it('deve considerar o dia da semana corretamente (domingo = 0 -> 7)', async () => {
      let chamadaDiaSemana: number | undefined;
      const mock = {
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockImplementation(function (this: any, ...args: any[]) {
          if (args[1] && args[1].diaSemana !== undefined) {
            chamadaDiaSemana = args[1].diaSemana;
          }
          return this;
        }),
        getMany: jest.fn().mockResolvedValue([]),
      };
      (aulasRepo.createQueryBuilder as jest.Mock).mockReturnValue(mock);

      // Domingo: localDt(2026, 4, 3) = 2026-05-03
      await service.checkGradeAulaConflito(
        'local-1',
        localDt(2026, 4, 3, 10, 0, 0),
        localDt(2026, 4, 3, 12, 0, 0),
      );
      expect(chamadaDiaSemana).toBe(7);
    });

    it('deve considerar o dia da semana corretamente (segunda = 1)', async () => {
      let chamadaDiaSemana: number | undefined;
      const mock = {
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockImplementation(function (this: any, ...args: any[]) {
          if (args[1] && args[1].diaSemana !== undefined) {
            chamadaDiaSemana = args[1].diaSemana;
          }
          return this;
        }),
        getMany: jest.fn().mockResolvedValue([]),
      };
      (aulasRepo.createQueryBuilder as jest.Mock).mockReturnValue(mock);

      // Segunda: localDt(2026, 4, 4) = 2026-05-04
      await service.checkGradeAulaConflito(
        'local-1',
        localDt(2026, 4, 4, 10, 0, 0),
        localDt(2026, 4, 4, 12, 0, 0),
      );
      expect(chamadaDiaSemana).toBe(1);
    });

    it('deve detectar conflito quando aula atravessa virada de ano e reserva ocorre em janeiro', async () => {
      // Aula: 2025-12-01 até 2026-01-31, terça-feira, 08-10
      const aulaAnoNovo = {
        ...mockAula,
        data_inicio: '2025-12-01',
        data_fim: '2026-01-31',
      };
      const mock = createQueryBuilderMock([aulaAnoNovo]);
      (aulasRepo.createQueryBuilder as jest.Mock).mockReturnValue(mock);

      // Terça-feira 06 de Janeiro de 2026
      const resultado = await service.checkGradeAulaConflito(
        'local-1',
        localDt(2026, 0, 6, 9, 0, 0),
        localDt(2026, 0, 6, 11, 0, 0),
      );
      expect(resultado).toContain('aula cadastrada');
    });
  });

  describe('checkEquipamentoReservaConflito', () => {
    it('deve retornar null quando não há conflitos de equipamento', async () => {
      const mock = createQueryBuilderMock(null);
      (reservasEquipamentosRepo.createQueryBuilder as jest.Mock).mockReturnValue(mock);

      const resultado = await service.checkEquipamentoReservaConflito(
        'equip-1',
        localDt(2026, 5, 1, 14, 0, 0),
        localDt(2026, 5, 1, 16, 0, 0),
      );
      expect(resultado).toBeNull();
    });

    it('deve retornar conflito quando há reserva pendente de equipamento', async () => {
      const mock = createQueryBuilderMock(mockReservaEquip);
      (reservasEquipamentosRepo.createQueryBuilder as jest.Mock).mockReturnValue(mock);

      const resultado = await service.checkEquipamentoReservaConflito(
        'equip-1',
        localDt(2026, 4, 1, 10, 30, 0),
        localDt(2026, 4, 1, 11, 30, 0),
      );
      expect(resultado).toBe('Este equipamento já está reservado por outra pessoa neste horário.');
    });

    it('deve ignorar reservas com status REJEITADA (filtradas pelo serviço)', async () => {
      const mockReservaRejeitada = { ...mockReservaEquip, status: 'rejeitada' };
      const mock = createQueryBuilderMock(mockReservaRejeitada);
      (reservasEquipamentosRepo.createQueryBuilder as jest.Mock).mockReturnValue(mock);

      const resultado = await service.checkEquipamentoReservaConflito(
        'equip-1',
        localDt(2026, 4, 1, 10, 30, 0),
        localDt(2026, 4, 1, 11, 30, 0),
      );
      expect(resultado).toBeNull();
    });
  });

  describe('checkEquipamentoLocalConflito', () => {
    it('deve retornar erro quando equipamento não existe', async () => {
      (equipamentosRepo.findOne as jest.Mock).mockResolvedValue(null);

      const resultado = await service.checkEquipamentoLocalConflito(
        'equip-inexistente',
        localDt(2026, 5, 1, 10, 0, 0),
        localDt(2026, 5, 1, 12, 0, 0),
      );
      expect(resultado).toBe('Equipamento não encontrado ou sem um local físico atrelado.');
    });

    it('deve retornar conflito quando local tem aula no horário', async () => {
      (equipamentosRepo.findOne as jest.Mock).mockResolvedValue(mockEquipamento);
      // 2026-05-05 = terca (dia_semana=2), aula tem dia_semana=2 e data valida
      const mock = createQueryBuilderMock([mockAula]);
      (aulasRepo.createQueryBuilder as jest.Mock).mockReturnValue(mock);

      const resultado = await service.checkEquipamentoLocalConflito(
        'equip-1',
        localDt(2026, 4, 5, 9, 0, 0),
        localDt(2026, 4, 5, 11, 0, 0),
      );
      expect(resultado).toContain('aula das 08:00:00 às 10:00:00');
    });

    it('deve retornar null quando local não tem aula no horário', async () => {
      (equipamentosRepo.findOne as jest.Mock).mockResolvedValue(mockEquipamento);
      const mock = createQueryBuilderMock([]);
      (aulasRepo.createQueryBuilder as jest.Mock).mockReturnValue(mock);

      const resultado = await service.checkEquipamentoLocalConflito(
        'equip-1',
        localDt(2026, 4, 5, 14, 0, 0),
        localDt(2026, 4, 5, 16, 0, 0),
      );
      expect(resultado).toBeNull();
    });
  });
});

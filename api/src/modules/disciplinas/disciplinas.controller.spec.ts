import { Test, TestingModule } from '@nestjs/testing';
import { DisciplinasController } from './disciplinas.controller';

describe('DisciplinasController', () => {
  let controller: DisciplinasController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DisciplinasController],
    }).compile();

    controller = module.get<DisciplinasController>(DisciplinasController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});

import { Test, TestingModule } from '@nestjs/testing';

import { mockServiceContextProvider } from '@/common/testing/mock-context';

import { UnitRepository } from './unit.repository';
import { UnitService } from './unit.service';

describe('UnitService', () => {
  let service: UnitService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UnitService,
        mockServiceContextProvider(),
        { provide: UnitRepository, useValue: {} },
      ],
    }).compile();

    service = module.get<UnitService>(UnitService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});

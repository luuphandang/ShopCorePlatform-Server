import { Test, TestingModule } from '@nestjs/testing';

import { mockServiceContextProvider } from '@/common/testing/mock-context';

import { ConversionUnitRepository } from './conversion-unit.repository';
import { ConversionUnitService } from './conversion-unit.service';

describe('ConversionUnitService', () => {
  let service: ConversionUnitService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ConversionUnitService,
        mockServiceContextProvider(),
        { provide: ConversionUnitRepository, useValue: {} },
      ],
    }).compile();

    service = module.get<ConversionUnitService>(ConversionUnitService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});

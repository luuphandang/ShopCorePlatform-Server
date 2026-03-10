import { Test, TestingModule } from '@nestjs/testing';

import { ConversionUnitService } from './conversion-unit.service';

describe('ConversionUnitService', () => {
  let service: ConversionUnitService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ConversionUnitService],
    }).compile();

    service = module.get<ConversionUnitService>(ConversionUnitService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});

import { Test, TestingModule } from '@nestjs/testing';

import { ConversionUnitRepository } from './conversion-unit.repository';
import { ConversionUnitResolver } from './conversion-unit.resolver';
import { ConversionUnitService } from './conversion-unit.service';

describe('ConversionUnitResolver', () => {
  let resolver: ConversionUnitResolver;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ConversionUnitResolver, ConversionUnitService, ConversionUnitRepository],
    }).compile();

    resolver = module.get<ConversionUnitResolver>(ConversionUnitResolver);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });
});

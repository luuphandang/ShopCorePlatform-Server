import { Test, TestingModule } from '@nestjs/testing';

import { mockCoreContextProvider } from '@/common/testing/mock-context';

import { ConversionUnitResolver } from './conversion-unit.resolver';
import { ConversionUnitService } from './conversion-unit.service';

describe('ConversionUnitResolver', () => {
  let resolver: ConversionUnitResolver;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ConversionUnitResolver,
        mockCoreContextProvider(),
        { provide: ConversionUnitService, useValue: {} },
      ],
    }).compile();

    resolver = module.get<ConversionUnitResolver>(ConversionUnitResolver);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });
});

import { Test, TestingModule } from '@nestjs/testing';

import { mockCoreContextProvider } from '@/common/testing/mock-context';

import { UnitResolver } from './unit.resolver';
import { UnitService } from './unit.service';

describe('UnitResolver', () => {
  let resolver: UnitResolver;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UnitResolver, mockCoreContextProvider(), { provide: UnitService, useValue: {} }],
    }).compile();

    resolver = module.get<UnitResolver>(UnitResolver);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });
});

import { Test, TestingModule } from '@nestjs/testing';

import { UnitResolver } from './unit.resolver';

describe('UnitResolver', () => {
  let resolver: UnitResolver;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UnitResolver],
    }).compile();

    resolver = module.get<UnitResolver>(UnitResolver);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });
});

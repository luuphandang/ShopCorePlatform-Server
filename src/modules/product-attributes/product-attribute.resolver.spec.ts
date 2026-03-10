import { Test, TestingModule } from '@nestjs/testing';

import { ProductAttributeResolver } from './product-attribute.resolver';

describe('ProductAttributeResolver', () => {
  let resolver: ProductAttributeResolver;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ProductAttributeResolver],
    }).compile();

    resolver = module.get<ProductAttributeResolver>(ProductAttributeResolver);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });
});

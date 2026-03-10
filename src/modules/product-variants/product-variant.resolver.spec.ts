import { Test, TestingModule } from '@nestjs/testing';

import { ProductVariantResolver } from './product-variant.resolver';

describe('ProductVariantResolver', () => {
  let resolver: ProductVariantResolver;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ProductVariantResolver],
    }).compile();

    resolver = module.get<ProductVariantResolver>(ProductVariantResolver);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });
});

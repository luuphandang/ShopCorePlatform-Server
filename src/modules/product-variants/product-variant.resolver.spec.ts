import { Test, TestingModule } from '@nestjs/testing';

import { mockCoreContextProvider } from '@/common/testing/mock-context';

import { ProductVariantResolver } from './product-variant.resolver';
import { ProductVariantService } from './product-variant.service';

describe('ProductVariantResolver', () => {
  let resolver: ProductVariantResolver;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductVariantResolver,
        mockCoreContextProvider(),
        { provide: ProductVariantService, useValue: {} },
      ],
    }).compile();

    resolver = module.get<ProductVariantResolver>(ProductVariantResolver);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });
});

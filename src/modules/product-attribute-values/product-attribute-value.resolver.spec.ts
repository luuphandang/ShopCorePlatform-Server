import { Test, TestingModule } from '@nestjs/testing';

import { ProductAttributeValueResolver } from './product-attribute-value.resolver';
import { ProductAttributeValueService } from './product-attribute-value.service';

describe('ProductAttributeValueResolver', () => {
  let resolver: ProductAttributeValueResolver;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ProductAttributeValueResolver, ProductAttributeValueService],
    }).compile();

    resolver = module.get<ProductAttributeValueResolver>(ProductAttributeValueResolver);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });
});

import { Test, TestingModule } from '@nestjs/testing';

import { mockServiceContextProvider } from '@/common/testing/mock-context';

import { ProductAttributeValueRepository } from './product-attribute-value.repository';
import { ProductAttributeValueService } from './product-attribute-value.service';

describe('ProductAttributeValueService', () => {
  let service: ProductAttributeValueService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductAttributeValueService,
        mockServiceContextProvider(),
        { provide: ProductAttributeValueRepository, useValue: {} },
      ],
    }).compile();

    service = module.get<ProductAttributeValueService>(ProductAttributeValueService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});

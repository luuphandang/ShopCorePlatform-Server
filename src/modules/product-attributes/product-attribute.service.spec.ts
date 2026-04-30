import { Test, TestingModule } from '@nestjs/testing';

import { mockServiceContextProvider } from '@/common/testing/mock-context';

import { ProductAttributeRepository } from './product-attribute.repository';
import { ProductAttributeService } from './product-attribute.service';

describe('ProductAttributeService', () => {
  let service: ProductAttributeService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductAttributeService,
        mockServiceContextProvider(),
        { provide: ProductAttributeRepository, useValue: {} },
      ],
    }).compile();

    service = module.get<ProductAttributeService>(ProductAttributeService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});

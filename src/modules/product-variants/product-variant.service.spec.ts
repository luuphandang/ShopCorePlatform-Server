import { Test, TestingModule } from '@nestjs/testing';

import { mockServiceContextProvider } from '@/common/testing/mock-context';

import { ProductVariantRepository } from './product-variant.repository';
import { ProductVariantService } from './product-variant.service';

describe('ProductVariantService', () => {
  let service: ProductVariantService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductVariantService,
        mockServiceContextProvider(),
        { provide: ProductVariantRepository, useValue: {} },
      ],
    }).compile();

    service = module.get<ProductVariantService>(ProductVariantService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});

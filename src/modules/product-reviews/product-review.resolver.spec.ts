import { Test, TestingModule } from '@nestjs/testing';

import { mockCoreContextProvider } from '@/common/testing/mock-context';

import { ProductReviewResolver } from './product-review.resolver';
import { ProductReviewService } from './product-review.service';

describe('ProductReviewResolver', () => {
  let resolver: ProductReviewResolver;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductReviewResolver,
        mockCoreContextProvider(),
        { provide: ProductReviewService, useValue: {} },
      ],
    }).compile();

    resolver = module.get<ProductReviewResolver>(ProductReviewResolver);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });
});

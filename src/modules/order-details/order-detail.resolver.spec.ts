import { Test, TestingModule } from '@nestjs/testing';

import { mockCoreContextProvider } from '@/common/testing/mock-context';

import { OrderDetailResolver } from './order-detail.resolver';
import { OrderDetailService } from './order-detail.service';

describe('OrderDetailResolver', () => {
  let resolver: OrderDetailResolver;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrderDetailResolver,
        mockCoreContextProvider(),
        { provide: OrderDetailService, useValue: {} },
      ],
    }).compile();

    resolver = module.get<OrderDetailResolver>(OrderDetailResolver);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });
});

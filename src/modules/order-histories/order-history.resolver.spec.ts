import { Test, TestingModule } from '@nestjs/testing';

import { mockCoreContextProvider } from '@/common/testing/mock-context';

import { OrderHistoryResolver } from './order-history.resolver';
import { OrderHistoryService } from './order-history.service';

describe('OrderHistoryResolver', () => {
  let resolver: OrderHistoryResolver;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrderHistoryResolver,
        mockCoreContextProvider(),
        { provide: OrderHistoryService, useValue: {} },
      ],
    }).compile();

    resolver = module.get<OrderHistoryResolver>(OrderHistoryResolver);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });
});

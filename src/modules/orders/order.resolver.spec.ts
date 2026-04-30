import { Test, TestingModule } from '@nestjs/testing';

import { mockCoreContextProvider } from '@/common/testing/mock-context';

import { OrderResolver } from './order.resolver';
import { OrderService } from './order.service';

describe('OrderResolver', () => {
  let resolver: OrderResolver;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrderResolver,
        mockCoreContextProvider(),
        { provide: OrderService, useValue: {} },
      ],
    }).compile();

    resolver = module.get<OrderResolver>(OrderResolver);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });
});

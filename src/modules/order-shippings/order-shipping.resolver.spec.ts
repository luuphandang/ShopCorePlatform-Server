import { Test, TestingModule } from '@nestjs/testing';

import { mockCoreContextProvider } from '@/common/testing/mock-context';

import { OrderShippingResolver } from './order-shipping.resolver';
import { OrderShippingService } from './order-shipping.service';

describe('OrderShippingResolver', () => {
  let resolver: OrderShippingResolver;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrderShippingResolver,
        mockCoreContextProvider(),
        { provide: OrderShippingService, useValue: {} },
      ],
    }).compile();

    resolver = module.get<OrderShippingResolver>(OrderShippingResolver);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });
});

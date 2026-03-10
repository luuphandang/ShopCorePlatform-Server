import { Test, TestingModule } from '@nestjs/testing';

import { OrderShippingResolver } from './order-shipping.resolver';

describe('OrderShippingResolver', () => {
  let resolver: OrderShippingResolver;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [OrderShippingResolver],
    }).compile();

    resolver = module.get<OrderShippingResolver>(OrderShippingResolver);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });
});

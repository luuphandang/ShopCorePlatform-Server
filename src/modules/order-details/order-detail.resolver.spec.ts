import { Test, TestingModule } from '@nestjs/testing';

import { OrderDetailResolver } from './order-detail.resolver';

describe('OrderDetailResolver', () => {
  let resolver: OrderDetailResolver;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [OrderDetailResolver],
    }).compile();

    resolver = module.get<OrderDetailResolver>(OrderDetailResolver);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });
});

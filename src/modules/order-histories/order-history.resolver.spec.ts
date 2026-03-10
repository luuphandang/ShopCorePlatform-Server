import { Test, TestingModule } from '@nestjs/testing';

import { OrderHistoryResolver } from './order-history.resolver';

describe('OrderHistoryResolver', () => {
  let resolver: OrderHistoryResolver;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [OrderHistoryResolver],
    }).compile();

    resolver = module.get<OrderHistoryResolver>(OrderHistoryResolver);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });
});

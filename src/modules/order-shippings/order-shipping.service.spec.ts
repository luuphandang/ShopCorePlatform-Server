import { Test, TestingModule } from '@nestjs/testing';

import { OrderShippingService } from './order-shipping.service';

describe('OrderShippingService', () => {
  let service: OrderShippingService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [OrderShippingService],
    }).compile();

    service = module.get<OrderShippingService>(OrderShippingService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});

import { Test, TestingModule } from '@nestjs/testing';

import { mockServiceContextProvider } from '@/common/testing/mock-context';

import { OrderShippingRepository } from './order-shipping.repository';
import { OrderShippingService } from './order-shipping.service';

describe('OrderShippingService', () => {
  let service: OrderShippingService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrderShippingService,
        mockServiceContextProvider(),
        { provide: OrderShippingRepository, useValue: {} },
      ],
    }).compile();

    service = module.get<OrderShippingService>(OrderShippingService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});

import { Test, TestingModule } from '@nestjs/testing';

import { mockServiceContextProvider } from '@/common/testing/mock-context';

import { OrderRepository } from './order.repository';
import { OrderService } from './order.service';

describe('OrderService', () => {
  let service: OrderService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrderService,
        mockServiceContextProvider(),
        { provide: OrderRepository, useValue: {} },
      ],
    }).compile();

    service = module.get<OrderService>(OrderService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});

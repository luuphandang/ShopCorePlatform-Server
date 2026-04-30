import { Test, TestingModule } from '@nestjs/testing';

import { mockServiceContextProvider } from '@/common/testing/mock-context';

import { OrderHistoryRepository } from './order-history.repository';
import { OrderHistoryService } from './order-history.service';

describe('OrderHistoryService', () => {
  let service: OrderHistoryService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrderHistoryService,
        mockServiceContextProvider(),
        { provide: OrderHistoryRepository, useValue: {} },
      ],
    }).compile();

    service = module.get<OrderHistoryService>(OrderHistoryService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});

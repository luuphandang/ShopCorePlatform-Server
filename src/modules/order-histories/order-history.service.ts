import { Injectable } from '@nestjs/common';

import { AbstractService } from '@/common/abstracts/service.abstract';
import { ServiceContext } from '@/common/contexts';

import { OrderHistory } from './entities/order-history.entity';
import { OrderHistoryRepository } from './order-history.repository';

@Injectable()
export class OrderHistoryService extends AbstractService<OrderHistory, OrderHistoryRepository> {
  constructor(
    serviceContext: ServiceContext,
    private readonly orderHistoryRepository: OrderHistoryRepository,
  ) {
    super(serviceContext, orderHistoryRepository);
  }

  protected initializeDependencies() {}
}

import { Injectable } from '@nestjs/common';

import { AbstractService } from '@/common/abstracts/service.abstract';
import { ServiceContext } from '@/common/contexts';

import { OrderShipping } from './entities/order-shipping.entity';
import { OrderShippingRepository } from './order-shipping.repository';

@Injectable()
export class OrderShippingService extends AbstractService<OrderShipping, OrderShippingRepository> {
  constructor(
    serviceContext: ServiceContext,
    private readonly orderShippingRepository: OrderShippingRepository,
  ) {
    super(serviceContext, orderShippingRepository);
  }

  protected initializeDependencies() {}
}

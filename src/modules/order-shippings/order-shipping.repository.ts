import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { AbstractRepository } from '@/common/abstracts/repository.abstract';
import { RepositoryContext } from '@/common/contexts';

import { OrderShipping } from './entities/order-shipping.entity';

@Injectable()
export class OrderShippingRepository extends AbstractRepository<OrderShipping> {
  constructor(
    repoContext: RepositoryContext,
    @InjectRepository(OrderShipping)
    orderShippingRepository: Repository<OrderShipping>,
  ) {
    super(repoContext, orderShippingRepository);
  }
}

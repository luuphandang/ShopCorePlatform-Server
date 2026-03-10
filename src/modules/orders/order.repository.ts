import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { AbstractRepository } from '@/common/abstracts/repository.abstract';
import { RepositoryContext } from '@/common/contexts';

import { Order } from './entities/order.entity';

@Injectable()
export class OrderRepository extends AbstractRepository<Order> {
  constructor(
    repoContext: RepositoryContext,
    @InjectRepository(Order)
    orderRepository: Repository<Order>,
  ) {
    super(repoContext, orderRepository);
  }
}

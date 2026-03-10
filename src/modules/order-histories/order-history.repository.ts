import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { AbstractRepository } from '@/common/abstracts/repository.abstract';
import { RepositoryContext } from '@/common/contexts';

import { OrderHistory } from './entities/order-history.entity';

@Injectable()
export class OrderHistoryRepository extends AbstractRepository<OrderHistory> {
  constructor(
    repoContext: RepositoryContext,
    @InjectRepository(OrderHistory)
    orderHistoryRepository: Repository<OrderHistory>,
  ) {
    super(repoContext, orderHistoryRepository);
  }
}

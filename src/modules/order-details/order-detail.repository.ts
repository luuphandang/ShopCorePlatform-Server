import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { AbstractRepository } from '@/common/abstracts/repository.abstract';
import { RepositoryContext } from '@/common/contexts';

import { OrderDetail } from './entities/order-detail.entity';

@Injectable()
export class OrderDetailRepository extends AbstractRepository<OrderDetail> {
  constructor(
    repoContext: RepositoryContext,
    @InjectRepository(OrderDetail)
    orderDetailRepository: Repository<OrderDetail>,
  ) {
    super(repoContext, orderDetailRepository);
  }
}

import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';

import { AbstractRepository } from '@/common/abstracts/repository.abstract';
import { EnvironmentVariables } from '@/common/helpers/env.validation';
import { AppLogger } from '@/common/logger/logger.service';
import { UtilService } from '@/common/utils/util.service';

import { OrderHistory } from './entities/order-history.entity';

@Injectable()
export class OrderHistoryRepository extends AbstractRepository<OrderHistory> {
  constructor(
    configService: ConfigService<EnvironmentVariables>,
    utilService: UtilService,
    appLogger: AppLogger,

    @InjectRepository(OrderHistory)
    private readonly orderHistoryRepository: Repository<OrderHistory>,
    dataSource: DataSource,
  ) {
    super(configService, utilService, appLogger, dataSource, orderHistoryRepository);
  }
}

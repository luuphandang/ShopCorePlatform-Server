import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';

import { AbstractRepository } from '@/common/abstracts/repository.abstract';
import { EnvironmentVariables } from '@/common/helpers/env.validation';
import { AppLogger } from '@/common/logger/logger.service';
import { UtilService } from '@/common/utils/util.service';

import { OrderShipping } from './entities/order-shipping.entity';

@Injectable()
export class OrderShippingRepository extends AbstractRepository<OrderShipping> {
  constructor(
    configService: ConfigService<EnvironmentVariables>,
    utilService: UtilService,
    appLogger: AppLogger,

    dataSource: DataSource,
    @InjectRepository(OrderShipping)
    private readonly orderShippingRepository: Repository<OrderShipping>,
  ) {
    super(configService, utilService, appLogger, dataSource, orderShippingRepository);
  }
}

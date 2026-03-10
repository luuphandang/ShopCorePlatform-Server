import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ModuleRef } from '@nestjs/core';

import { AbstractService } from '@/common/abstracts/service.abstract';
import { EnvironmentVariables } from '@/common/helpers/env.validation';
import { AppLogger } from '@/common/logger/logger.service';
import { RabbitMQService } from '@/common/rabbitmq/rabbitmq.service';
import { UtilService } from '@/common/utils/util.service';

import { ProductAttributeValue } from './entities/product-attribute-value.entity';
import { ProductAttributeValueRepository } from './product-attribute-value.repository';
import { RedisService } from '@/common/redis/redis.service';

@Injectable()
export class ProductAttributeValueService extends AbstractService<
  ProductAttributeValue,
  ProductAttributeValueRepository
> {
  constructor(
    configService: ConfigService<EnvironmentVariables>,
    utilService: UtilService,
    appLogger: AppLogger,
    rabbitMQService: RabbitMQService,
    redisService: RedisService,
    moduleRef: ModuleRef,

    private readonly productAttributeValueRepository: ProductAttributeValueRepository,
  ) {
    super(
      configService,
      utilService,
      appLogger,
      rabbitMQService,
      redisService,
      moduleRef,
      productAttributeValueRepository,
    );
  }

  protected initializeDependencies() {}
}

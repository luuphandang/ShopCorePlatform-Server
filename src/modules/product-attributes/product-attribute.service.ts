import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ModuleRef } from '@nestjs/core';

import { AbstractService } from '@/common/abstracts/service.abstract';
import { EnvironmentVariables } from '@/common/helpers/env.validation';
import { AppLogger } from '@/common/logger/logger.service';
import { RabbitMQService } from '@/common/rabbitmq/rabbitmq.service';
import { UtilService } from '@/common/utils/util.service';

import { ProductAttribute } from './entities/product-attribute.entity';
import { ProductAttributeRepository } from './product-attribute.repository';
import { RedisService } from '@/common/redis/redis.service';

@Injectable()
export class ProductAttributeService extends AbstractService<
  ProductAttribute,
  ProductAttributeRepository
> {
  constructor(
    configService: ConfigService<EnvironmentVariables>,
    utilService: UtilService,
    appLogger: AppLogger,
    rabbitMQService: RabbitMQService,
    redisService: RedisService,
    moduleRef: ModuleRef,

    private readonly productAttributeRepository: ProductAttributeRepository,
  ) {
    super(
      configService,
      utilService,
      appLogger,
      rabbitMQService,
      redisService,
      moduleRef,
      productAttributeRepository,
    );
  }

  protected initializeDependencies() {}
}

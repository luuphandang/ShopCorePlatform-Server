import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ModuleRef } from '@nestjs/core';

import { AbstractService } from '@/common/abstracts/service.abstract';
import { EnvironmentVariables } from '@/common/helpers/env.validation';
import { AppLogger } from '@/common/logger/logger.service';
import { RabbitMQService } from '@/common/rabbitmq/rabbitmq.service';
import { UtilService } from '@/common/utils/util.service';

import { Unit } from './entities/unit.entity';
import { UnitRepository } from './unit.repository';
import { RedisService } from '@/common/redis/redis.service';

@Injectable()
export class UnitService extends AbstractService<Unit, UnitRepository> {
  constructor(
    configService: ConfigService<EnvironmentVariables>,
    utilService: UtilService,
    appLogger: AppLogger,
    rabbitMQService: RabbitMQService,
    redisService: RedisService,
    moduleRef: ModuleRef,

    private readonly unitRepository: UnitRepository,
  ) {
    super(configService, utilService, appLogger, rabbitMQService, redisService, moduleRef, unitRepository);
  }

  protected initializeDependencies() {}
}

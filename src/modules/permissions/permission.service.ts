import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ModuleRef } from '@nestjs/core';

import { AbstractService } from '@/common/abstracts/service.abstract';
import { EnvironmentVariables } from '@/common/helpers/env.validation';
import { AppLogger } from '@/common/logger/logger.service';
import { RabbitMQService } from '@/common/rabbitmq/rabbitmq.service';
import { UtilService } from '@/common/utils/util.service';

import { Permission } from './entities/permission.entity';
import { PermissionRepository } from './permission.repository';
import { RedisService } from '@/common/redis/redis.service';

@Injectable()
export class PermissionService extends AbstractService<Permission, PermissionRepository> {
  constructor(
    configService: ConfigService<EnvironmentVariables>,
    utilService: UtilService,
    appLogger: AppLogger,
    rabbitMQService: RabbitMQService,
    redisService: RedisService,
    moduleRef: ModuleRef,

    private readonly permissionRepository: PermissionRepository,
  ) {
    super(configService, utilService, appLogger, rabbitMQService, redisService, moduleRef, permissionRepository);
  }

  protected initializeDependencies() {}
}

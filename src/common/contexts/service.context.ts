import { Injectable } from '@nestjs/common';
import { ModuleRef } from '@nestjs/core';

import { RabbitMQService } from '../rabbitmq/rabbitmq.service';
import { RedisService } from '../redis/redis.service';
import { CoreContext } from './core.context';

@Injectable()
export class ServiceContext {
  constructor(
    readonly core: CoreContext,
    readonly rabbitMQService: RabbitMQService,
    readonly redisService: RedisService,
    readonly moduleRef: ModuleRef,
  ) {}
}

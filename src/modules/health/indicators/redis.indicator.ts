import { Inject, Injectable } from '@nestjs/common';
import { HealthCheckError, HealthIndicator, HealthIndicatorResult } from '@nestjs/terminus';
import Redis from 'ioredis';

import { MODULE_CONFIGS } from '@/common/constants/module.constant';

@Injectable()
export class RedisHealthIndicator extends HealthIndicator {
  constructor(@Inject(MODULE_CONFIGS.REDIS) private readonly redis: Redis) {
    super();
  }

  async isHealthy(key: string): Promise<HealthIndicatorResult> {
    try {
      const pong = await this.redis.ping();
      const ok = pong === 'PONG';
      const result = this.getStatus(key, ok, { response: pong });

      if (!ok) {
        throw new HealthCheckError('Redis ping returned unexpected response', result);
      }

      return result;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'unknown error';
      throw new HealthCheckError('Redis check failed', this.getStatus(key, false, { message }));
    }
  }
}

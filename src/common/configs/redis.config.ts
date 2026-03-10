import { ConfigService } from '@nestjs/config';
import { RedisOptions } from 'ioredis';

import { EnvironmentVariables } from '../helpers/env.validation';

export const redisConfig = (
  configService: ConfigService<EnvironmentVariables>,
): RedisOptions => {
  return {
    host: configService.get<string>('REDIS_HOST') || 'localhost',
    port: configService.get<number>('REDIS_PORT') || 6379,
    password: configService.get<string>('REDIS_PASSWORD') || undefined,
    db: 0,
    retryStrategy: (times: number) => {
      const delay = Math.min(times * 50, 2000);
      return delay;
    },
    maxRetriesPerRequest: 3,
    enableReadyCheck: true,
    enableOfflineQueue: false,
    lazyConnect: true,
  };
};

export const getRedisTTL = (
  configService: ConfigService<EnvironmentVariables>,
): number => {
  return configService.get<number>('REDIS_TTL') || 3600; // Default 1 hour
};

export const getRedisKeyPrefix = (
  configService: ConfigService<EnvironmentVariables>,
): string => {
  return configService.get<string>('REDIS_KEY_PREFIX') || 'shopcore:';
};

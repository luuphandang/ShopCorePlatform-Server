import { DynamicModule, Global, Logger, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

import { redisConfig } from '../configs/redis.config';
import { EnvironmentVariables } from '../helpers/env.validation';
import { RedisService } from './redis.service';
import { MODULE_CONFIGS } from '../constants/module.constant';

export interface RedisModuleOptions {
  isGlobal?: boolean;
}

@Global()
@Module({})
export class RedisModule {
  static forRootAsync(options: RedisModuleOptions = {}): DynamicModule {
    return {
      module: RedisModule,
      imports: [ConfigModule],
      providers: [
        {
          provide: MODULE_CONFIGS.REDIS,
          useFactory: async (configService: ConfigService<EnvironmentVariables>) => {
            const config = redisConfig(configService);
            const logger = new Logger('RedisModule');
            const redis = new Redis(config);

            redis.on('connect', () => {
              logger.log('Redis connected');
            });

            redis.on('error', (error) => {
              logger.error('Redis error:', error);
            });

            redis.on('close', () => {
              logger.warn('Redis connection closed');
            });

            await redis.connect();

            return redis;
          },
          inject: [ConfigService],
        },
        RedisService,
      ],
      exports: [RedisService, MODULE_CONFIGS.REDIS],
      global: options.isGlobal || false,
    };
  }
}

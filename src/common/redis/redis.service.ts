import { Inject, Injectable, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

import { AbstractBase } from '../abstracts/base.abstract';
import { getRedisKeyPrefix, getRedisTTL } from '../configs/redis.config';
import { EnvironmentVariables } from '../helpers/env.validation';
import { AppLogger } from '../logger/logger.service';
import { UtilService } from '../utils/util.service';

@Injectable()
export class RedisService extends AbstractBase implements OnModuleDestroy {
  private readonly keyPrefix: string;
  private readonly defaultTTL: number;

  constructor(
    configService: ConfigService<EnvironmentVariables>,
    utilService: UtilService,
    appLogger: AppLogger,

    @Inject('REDIS_CLIENT') private readonly redis: Redis,
  ) {
    super(configService, utilService, appLogger);
    this.keyPrefix = getRedisKeyPrefix(configService);
    this.defaultTTL = getRedisTTL(configService);
  }

  async onModuleDestroy() {
    await this.redis.quit();
  }

  /**
   * Generate cache key with prefix
   */
  private getKey(key: string): string {
    return `${this.keyPrefix}${key}`;
  }

  /**
   * Get value from cache
   */
  async get<T>(key: string): Promise<T | null> {
    try {
      const value = await this.redis.get(this.getKey(key));
      if (!value) return null;

      return JSON.parse(value) as T;
    } catch (error) {
      this.logger.error(`Redis get error for key ${key}: ${error.message}`, this.className);
      return null;
    }
  }

  /**
   * Set value to cache
   */
  async set(key: string, value: unknown, ttl?: number): Promise<boolean> {
    try {
      const serialized = JSON.stringify(value);
      const expireTime = ttl || this.defaultTTL;

      await this.redis.setex(this.getKey(key), expireTime, serialized);
      return true;
    } catch (error) {
      this.logger.error(`Redis set error for key ${key}: ${error.message}`, this.className);
      return false;
    }
  }

  /**
   * Delete value from cache
   */
  async del(key: string): Promise<boolean> {
    try {
      await this.redis.del(this.getKey(key));
      return true;
    } catch (error) {
      this.logger.error(`Redis del error for key ${key}: ${error.message}`, this.className);
      return false;
    }
  }

  /**
   * Delete multiple keys
   */
  async delMany(keys: string[]): Promise<number> {
    try {
      if (keys.length === 0) return 0;

      const prefixedKeys = keys.map((key) => this.getKey(key));
      return await this.redis.del(...prefixedKeys);
    } catch (error) {
      this.logger.error(`Redis delMany error: ${error.message}`, this.className);
      return 0;
    }
  }

  /**
   * Check if key exists
   */
  async exists(key: string): Promise<boolean> {
    try {
      const result = await this.redis.exists(this.getKey(key));
      return result === 1;
    } catch (error) {
      this.logger.error(`Redis exists error for key ${key}: ${error.message}`, this.className);
      return false;
    }
  }

  /**
   * Get TTL of a key
   */
  async ttl(key: string): Promise<number> {
    try {
      return await this.redis.ttl(this.getKey(key));
    } catch (error) {
      this.logger.error(`Redis ttl error for key ${key}: ${error.message}`, this.className);
      return -1;
    }
  }

  /**
   * Set expiration for a key
   */
  async expire(key: string, seconds: number): Promise<boolean> {
    try {
      const result = await this.redis.expire(this.getKey(key), seconds);
      return result === 1;
    } catch (error) {
      this.logger.error(`Redis expire error for key ${key}: ${error.message}`, this.className);
      return false;
    }
  }

  /**
   * Increment value
   */
  async incr(key: string): Promise<number> {
    try {
      return await this.redis.incr(this.getKey(key));
    } catch (error) {
      this.logger.error(`Redis incr error for key ${key}: ${error.message}`, this.className);
      throw error;
    }
  }

  /**
   * Decrement value
   */
  async decr(key: string): Promise<number> {
    try {
      return await this.redis.decr(this.getKey(key));
    } catch (error) {
      this.logger.error(`Redis decr error for key ${key}: ${error.message}`, this.className);
      throw error;
    }
  }

  /**
   * Get multiple values
   */
  async mget<T>(keys: string[]): Promise<(T | null)[]> {
    try {
      if (keys.length === 0) return [];

      const prefixedKeys = keys.map((key) => this.getKey(key));
      const values = await this.redis.mget(...prefixedKeys);

      return values.map((value) => {
        if (!value) return null;
        try {
          return JSON.parse(value) as T;
        } catch {
          return null;
        }
      });
    } catch (error) {
      this.logger.error(`Redis mget error: ${error.message}`, this.className);
      return [];
    }
  }

  /**
   * Set multiple values
   */
  async mset(keyValuePairs: Record<string, unknown>, ttl?: number): Promise<boolean> {
    try {
      const pipeline = this.redis.pipeline();
      const expireTime = ttl || this.defaultTTL;

      for (const [key, value] of Object.entries(keyValuePairs)) {
        const serialized = JSON.stringify(value);
        pipeline.setex(this.getKey(key), expireTime, serialized);
      }

      await pipeline.exec();
      return true;
    } catch (error) {
      this.logger.error(`Redis mset error: ${error.message}`, this.className);
      return false;
    }
  }

  /**
   * Delete keys by pattern
   */
  async delByPattern(pattern: string): Promise<number> {
    try {
      const fullPattern = this.getKey(pattern);
      const stream = this.redis.scanStream({
        match: fullPattern,
        count: 100,
      });

      let deletedCount = 0;
      const keysToDelete: string[] = [];

      stream.on('data', (keys: string[]) => {
        keysToDelete.push(...keys);
      });

      await new Promise<void>((resolve, reject) => {
        stream.on('end', resolve);
        stream.on('error', reject);
      });

      if (keysToDelete.length > 0) {
        deletedCount = await this.redis.del(...keysToDelete);
      }

      return deletedCount;
    } catch (error) {
      this.logger.error(`Redis delByPattern error for pattern ${pattern}: ${error.message}`, this.className);
      return 0;
    }
  }

  /**
   * Get Redis client (for advanced operations)
   */
  getClient(): Redis {
    return this.redis;
  }

  /**
   * Clear all cache (use with caution)
   */
  async flushAll(): Promise<boolean> {
    try {
      await this.redis.flushall();
      this.logger.warn('Redis cache flushed', this.className);
      return true;
    } catch (error) {
      this.logger.error(`Redis flushAll error: ${error.message}`, this.className);
      return false;
    }
  }
}

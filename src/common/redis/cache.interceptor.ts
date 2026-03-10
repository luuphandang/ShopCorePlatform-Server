import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable, of } from 'rxjs';
import { tap } from 'rxjs/operators';

import { CACHE_INVALIDATE, CACHE_KEY, CACHE_TTL } from './cache.decorator';
import { RedisService } from './redis.service';

@Injectable()
export class CacheInterceptor implements NestInterceptor {
  constructor(
    private readonly redisService: RedisService,
    private readonly reflector: Reflector,
  ) {}

  async intercept(context: ExecutionContext, next: CallHandler): Promise<Observable<unknown>> {
    const request = context.switchToHttp().getRequest();
    const handler = context.getHandler();
    const className = context.getClass().name;

    const cacheKey = this.reflector.get<string>(CACHE_KEY, handler);
    const cacheTTL = this.reflector.get<number>(CACHE_TTL, handler);
    const invalidateKeys = this.reflector.get<string[]>(CACHE_INVALIDATE, handler);

    if (invalidateKeys && invalidateKeys.length > 0) {
      return next.handle().pipe(
        tap(async () => {
          for (const keyPattern of invalidateKeys) {
            const key = this.buildCacheKey(keyPattern, className, handler.name, request);
            await this.redisService.delByPattern(key);
          }
        }),
      );
    }

    if (cacheKey) {
      const key = this.buildCacheKey(cacheKey, className, handler.name, request);

      const cached = await this.redisService.get(key);
      if (cached !== null) {
        return of(cached);
      }

      return next.handle().pipe(
        tap(async (data) => {
          if (data !== null && data !== undefined) {
            await this.redisService.set(key, data, cacheTTL);
          }
        }),
      );
    }

    return next.handle();
  }

  private buildCacheKey(
    pattern: string,
    className: string,
    methodName: string,
    request: unknown,
  ): string {
    let key = pattern;

    key = key.replace('{className}', className);
    key = key.replace('{methodName}', methodName);

    if (request && typeof request === 'object') {
      const params = request as Record<string, unknown>;
      for (const [paramKey, paramValue] of Object.entries(params)) {
        const placeholder = `{${paramKey}}`;
        if (key.includes(placeholder)) {
          key = key.replace(placeholder, String(paramValue));
        }
      }

      if ('args' in params && params.args && typeof params.args === 'object') {
        const args = params.args as Record<string, unknown>;
        for (const [argKey, argValue] of Object.entries(args)) {
          const placeholder = `{${argKey}}`;
          if (key.includes(placeholder)) {
            key = key.replace(placeholder, String(argValue));
          }
        }
      }
    }

    return key;
  }
}

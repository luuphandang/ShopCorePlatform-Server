import { SetMetadata } from '@nestjs/common';

export const CACHE_KEY = 'cache:key';
export const CACHE_TTL = 'cache:ttl';
export const CACHE_INVALIDATE = 'cache:invalidate';

/**
 * Decorator to cache method result
 * @param key - Cache key (can use function parameters: {id} will be replaced with actual id)
 * @param ttl - Time to live in seconds (optional, uses default if not provided)
 */
export const Cacheable = (key: string, ttl?: number) => {
  return (target: unknown, propertyKey: string, descriptor: PropertyDescriptor) => {
    SetMetadata(CACHE_KEY, key)(target, propertyKey, descriptor);
    if (ttl) {
      SetMetadata(CACHE_TTL, ttl)(target, propertyKey, descriptor);
    }
  };
};

/**
 * Decorator to invalidate cache after method execution
 * @param keys - Cache keys to invalidate (can use function parameters)
 */
export const CacheInvalidate = (...keys: string[]) => {
  return (target: unknown, propertyKey: string, descriptor: PropertyDescriptor) => {
    SetMetadata(CACHE_INVALIDATE, keys)(target, propertyKey, descriptor);
  };
};

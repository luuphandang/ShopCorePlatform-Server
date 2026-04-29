import { HealthCheckError } from '@nestjs/terminus';
import type Redis from 'ioredis';

import { RedisHealthIndicator } from './redis.indicator';

describe('RedisHealthIndicator', () => {
  const buildRedis = (impl: () => Promise<string>): Redis =>
    ({ ping: jest.fn(impl) }) as unknown as Redis;

  it('reports up when ping returns PONG', async () => {
    const indicator = new RedisHealthIndicator(buildRedis(() => Promise.resolve('PONG')));

    const result = await indicator.isHealthy('redis');

    expect(result).toEqual({ redis: { status: 'up', response: 'PONG' } });
  });

  it('throws HealthCheckError when ping returns unexpected response', async () => {
    const indicator = new RedisHealthIndicator(buildRedis(() => Promise.resolve('NOPE')));

    await expect(indicator.isHealthy('redis')).rejects.toBeInstanceOf(HealthCheckError);
  });

  it('throws HealthCheckError when ping rejects', async () => {
    const indicator = new RedisHealthIndicator(
      buildRedis(() => Promise.reject(new Error('connection refused'))),
    );

    await expect(indicator.isHealthy('redis')).rejects.toMatchObject({
      message: 'Redis check failed',
      causes: { redis: { status: 'down', message: 'connection refused' } },
    });
  });
});

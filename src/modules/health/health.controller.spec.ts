import { HealthCheckResult, HealthCheckService, TypeOrmHealthIndicator } from '@nestjs/terminus';

import { HealthController } from './health.controller';
import { RabbitMQHealthIndicator } from './indicators/rabbitmq.indicator';
import { RedisHealthIndicator } from './indicators/redis.indicator';

describe('HealthController', () => {
  const okResult: HealthCheckResult = { status: 'ok', info: {}, error: {}, details: {} };

  const buildController = () => {
    const health = {
      check: jest.fn().mockResolvedValue(okResult),
    } as unknown as HealthCheckService;

    const db = {
      pingCheck: jest.fn().mockResolvedValue({ database: { status: 'up' } }),
    } as unknown as TypeOrmHealthIndicator;

    const redis = {
      isHealthy: jest.fn().mockResolvedValue({ redis: { status: 'up' } }),
    } as unknown as RedisHealthIndicator;

    const rabbitmq = {
      isHealthy: jest.fn().mockResolvedValue({ rabbitmq: { status: 'up' } }),
    } as unknown as RabbitMQHealthIndicator;

    return {
      controller: new HealthController(health, db, redis, rabbitmq),
      health,
      db,
      redis,
      rabbitmq,
    };
  };

  it('liveness runs an empty check list', async () => {
    const { controller, health } = buildController();

    await controller.liveness();

    expect(health.check).toHaveBeenCalledWith([]);
  });

  it('readiness checks database, redis and rabbitmq', async () => {
    const { controller, health, db, redis, rabbitmq } = buildController();

    await controller.readiness();

    expect(health.check).toHaveBeenCalledTimes(1);
    const [indicators] = (health.check as jest.Mock).mock.calls[0];
    expect(Array.isArray(indicators)).toBe(true);
    expect(indicators).toHaveLength(3);

    await Promise.all((indicators as Array<() => Promise<unknown>>).map((fn) => fn()));

    expect(db.pingCheck).toHaveBeenCalledWith('database', { timeout: 3000 });
    expect(redis.isHealthy).toHaveBeenCalledWith('redis');
    expect(rabbitmq.isHealthy).toHaveBeenCalledWith('rabbitmq');
  });

  it('startup delegates to readiness', async () => {
    const { controller, health } = buildController();

    await controller.startup();

    expect(health.check).toHaveBeenCalledTimes(1);
  });
});

import {
  HealthCheckError,
  HealthCheckResult,
  HealthCheckService,
  TypeOrmHealthIndicator,
} from '@nestjs/terminus';

import { ShutdownState } from '@/common/lifecycle/shutdown.state';

import { HealthController } from './health.controller';
import { RabbitMQHealthIndicator } from './indicators/rabbitmq.indicator';
import { RedisHealthIndicator } from './indicators/redis.indicator';

describe('HealthController', () => {
  const okResult: HealthCheckResult = { status: 'ok', info: {}, error: {}, details: {} };

  const buildController = (overrides: { shuttingDown?: boolean; signal?: string } = {}) => {
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

    const shutdownState = new ShutdownState();
    if (overrides.shuttingDown) {
      shutdownState.onApplicationShutdown(overrides.signal);
    }

    return {
      controller: new HealthController(health, db, redis, rabbitmq, shutdownState),
      health,
      db,
      redis,
      rabbitmq,
      shutdownState,
    };
  };

  it('liveness runs an empty check list', async () => {
    const { controller, health } = buildController();

    await controller.liveness();

    expect(health.check).toHaveBeenCalledWith([]);
  });

  it('readiness checks lifecycle, database, redis and rabbitmq', async () => {
    const { controller, health, db, redis, rabbitmq } = buildController();

    await controller.readiness();

    expect(health.check).toHaveBeenCalledTimes(1);
    const [indicators] = (health.check as jest.Mock).mock.calls[0];
    expect(Array.isArray(indicators)).toBe(true);
    expect(indicators).toHaveLength(4);

    const results = await Promise.all(
      (indicators as Array<() => Promise<unknown>>).map((fn) => fn()),
    );

    expect(results[0]).toEqual({ lifecycle: { status: 'up' } });
    expect(db.pingCheck).toHaveBeenCalledWith('database', { timeout: 3000 });
    expect(redis.isHealthy).toHaveBeenCalledWith('redis');
    expect(rabbitmq.isHealthy).toHaveBeenCalledWith('rabbitmq');
  });

  it('readiness lifecycle indicator throws HealthCheckError while shutting down', async () => {
    const { controller, health } = buildController({ shuttingDown: true, signal: 'SIGTERM' });

    await controller.readiness();

    const [indicators] = (health.check as jest.Mock).mock.calls[0];
    const lifecycle = (indicators as Array<() => unknown>)[0];

    expect(lifecycle).toBeDefined();
    let caught: unknown;
    try {
      lifecycle();
    } catch (err) {
      caught = err;
    }
    expect(caught).toBeInstanceOf(HealthCheckError);
    expect((caught as HealthCheckError).causes).toEqual({
      lifecycle: { status: 'down', signal: 'SIGTERM' },
    });
  });

  it('startup delegates to readiness', async () => {
    const { controller, health } = buildController();

    await controller.startup();

    expect(health.check).toHaveBeenCalledTimes(1);
  });
});

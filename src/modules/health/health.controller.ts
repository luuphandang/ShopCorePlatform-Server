import { Controller, Get } from '@nestjs/common';
import {
  HealthCheck,
  HealthCheckError,
  HealthCheckResult,
  HealthCheckService,
  HealthIndicatorResult,
  TypeOrmHealthIndicator,
} from '@nestjs/terminus';
import { SkipThrottle } from '@nestjs/throttler';

import { ShutdownState } from '@/common/lifecycle/shutdown.state';

import { RabbitMQHealthIndicator } from './indicators/rabbitmq.indicator';
import { RedisHealthIndicator } from './indicators/redis.indicator';

@Controller('health')
@SkipThrottle()
export class HealthController {
  constructor(
    private readonly health: HealthCheckService,
    private readonly db: TypeOrmHealthIndicator,
    private readonly redis: RedisHealthIndicator,
    private readonly rabbitmq: RabbitMQHealthIndicator,
    private readonly shutdownState: ShutdownState,
  ) {}

  @Get('liveness')
  @HealthCheck()
  liveness(): Promise<HealthCheckResult> {
    return this.health.check([]);
  }

  @Get('readiness')
  @HealthCheck()
  readiness(): Promise<HealthCheckResult> {
    return this.health.check([
      () => this.lifecycleCheck(),
      () => this.db.pingCheck('database', { timeout: 3000 }),
      () => this.redis.isHealthy('redis'),
      () => this.rabbitmq.isHealthy('rabbitmq'),
    ]);
  }

  private lifecycleCheck(): HealthIndicatorResult {
    if (this.shutdownState.isShuttingDown()) {
      // Why: orchestrators (k8s, ECS) must stop routing traffic during drain.
      throw new HealthCheckError('Service is shutting down', {
        lifecycle: { status: 'down', signal: this.shutdownState.getSignal() },
      });
    }
    return { lifecycle: { status: 'up' } };
  }

  @Get('startup')
  @HealthCheck()
  startup(): Promise<HealthCheckResult> {
    return this.readiness();
  }
}

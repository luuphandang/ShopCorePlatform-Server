import { Module } from '@nestjs/common';
import { TerminusModule } from '@nestjs/terminus';

import { HealthController } from './health.controller';
import { RabbitMQHealthIndicator } from './indicators/rabbitmq.indicator';
import { RedisHealthIndicator } from './indicators/redis.indicator';

@Module({
  imports: [TerminusModule],
  controllers: [HealthController],
  providers: [RedisHealthIndicator, RabbitMQHealthIndicator],
})
export class HealthModule {}

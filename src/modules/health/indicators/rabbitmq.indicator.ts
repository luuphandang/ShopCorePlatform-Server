import { Injectable } from '@nestjs/common';
import { HealthCheckError, HealthIndicator, HealthIndicatorResult } from '@nestjs/terminus';

import { RabbitMQService } from '@/common/rabbitmq/rabbitmq.service';

@Injectable()
export class RabbitMQHealthIndicator extends HealthIndicator {
  constructor(private readonly rabbitmq: RabbitMQService) {
    super();
  }

  async isHealthy(key: string, timeoutMs = 3000): Promise<HealthIndicatorResult> {
    const ok = await this.rabbitmq.isHealthy(timeoutMs);
    const result = this.getStatus(key, ok);

    if (!ok) {
      throw new HealthCheckError('RabbitMQ check failed', result);
    }

    return result;
  }
}

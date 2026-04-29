import { HealthCheckError } from '@nestjs/terminus';

import { RabbitMQService } from '@/common/rabbitmq/rabbitmq.service';

import { RabbitMQHealthIndicator } from './rabbitmq.indicator';

describe('RabbitMQHealthIndicator', () => {
  const buildService = (healthy: boolean): RabbitMQService =>
    ({ isHealthy: jest.fn().mockResolvedValue(healthy) }) as unknown as RabbitMQService;

  it('reports up when service is healthy', async () => {
    const indicator = new RabbitMQHealthIndicator(buildService(true));

    const result = await indicator.isHealthy('rabbitmq');

    expect(result).toEqual({ rabbitmq: { status: 'up' } });
  });

  it('throws HealthCheckError when service reports unhealthy', async () => {
    const indicator = new RabbitMQHealthIndicator(buildService(false));

    await expect(indicator.isHealthy('rabbitmq')).rejects.toBeInstanceOf(HealthCheckError);
  });

  it('forwards timeout argument to RabbitMQService', async () => {
    const service = buildService(true);
    const indicator = new RabbitMQHealthIndicator(service);

    await indicator.isHealthy('rabbitmq', 1000);

    expect(service.isHealthy).toHaveBeenCalledWith(1000);
  });
});

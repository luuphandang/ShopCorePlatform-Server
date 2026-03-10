import { ConfigService } from '@nestjs/config';

import { EnvironmentVariables } from '@/common/helpers/env.validation';
import { RabbitMQModuleOptions } from '@/common/rabbitmq/rabbitmq.module';

export const rabbitmqConfig = async (
  configService: ConfigService<EnvironmentVariables>,
): Promise<RabbitMQModuleOptions> => {
  return {
    uri: configService.get<string>('RABBITMQ_URI'),
    prefetchCount: 10,
    reconnectDelay: 5000,
    maxReconnectAttempts: 5,
    exchangeOptions: {
      durable: true,
      autoDelete: false,
    },
    queueOptions: {
      durable: true,
      exclusive: false,
      autoDelete: false,
    },
  };
};

import { ConfigService } from '@nestjs/config';
import { KafkaOptions, Transport } from '@nestjs/microservices';

import { EnvironmentVariables } from '../helpers/env.validation';

export const kafkaConfig = (configService: ConfigService<EnvironmentVariables>): KafkaOptions => ({
  transport: Transport.KAFKA,
  options: {
    client: {
      brokers: [configService.get('KAFKA_BROKERS')],
    },
  },
});

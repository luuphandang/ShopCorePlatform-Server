import { ConfigService } from '@nestjs/config';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';

import { EnvironmentVariables } from '@/common/helpers/env.validation';

export const typeOrmConfig = async (
  configService: ConfigService<EnvironmentVariables>,
): Promise<TypeOrmModuleOptions> => {
  const nodeEnv = configService.get<string>('NODE_ENV');
  const requestedSync = configService.get<string>('DB_SYNCHRONIZE') === 'true';

  if (nodeEnv === 'production' && requestedSync) {
    throw new Error(
      'FATAL: DB_SYNCHRONIZE=true is forbidden when NODE_ENV=production. Use migrations instead.',
    );
  }

  return {
    type: 'postgres',
    host: configService.get<string>('DB_HOST'),
    port: configService.get<number>('DB_PORT'),
    username: configService.get<string>('DB_USER'),
    password: configService.get<string>('DB_PASSWORD'),
    database: configService.get<string>('DB_NAME'),
    schema: 'public',
    entities: ['dist/**/*.entity.js'],
    autoLoadEntities: true,
    dropSchema: false,
    synchronize: nodeEnv === 'production' ? false : requestedSync,
    migrationsRun: configService.get<string>('DB_MIGRATIONS_RUN') === 'true',
    logging: configService.get<string>('DB_LOGGING') === 'true',
  };
};

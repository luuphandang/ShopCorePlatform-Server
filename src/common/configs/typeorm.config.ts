import { ConfigService } from '@nestjs/config';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';

import { EnvironmentVariables } from '@/common/helpers/env.validation';

export const typeOrmConfig = async (
  configService: ConfigService<EnvironmentVariables>,
): Promise<TypeOrmModuleOptions> => {
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
    synchronize: configService.get<string>('DB_SYNCHRONIZE') === 'true',
    logging: configService.get<string>('DB_LOGGING') === 'false',
  };
};

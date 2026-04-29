import { ConfigService } from '@nestjs/config';

import { EnvironmentVariables } from '@/common/helpers/env.validation';

import { typeOrmConfig } from './typeorm.config';

type EnvMap = Record<string, string | number | undefined>;

const buildConfigService = (env: EnvMap): ConfigService<EnvironmentVariables> => {
  return {
    get: <T>(key: string): T | undefined => env[key] as T | undefined,
  } as unknown as ConfigService<EnvironmentVariables>;
};

const baseEnv: EnvMap = {
  DB_HOST: 'localhost',
  DB_PORT: 5432,
  DB_USER: 'postgres',
  DB_PASSWORD: 'postgres',
  DB_NAME: 'shopcore',
  DB_MIGRATIONS_RUN: 'false',
};

describe('typeOrmConfig', () => {
  it('throws when NODE_ENV=production and DB_SYNCHRONIZE=true', async () => {
    const cs = buildConfigService({
      ...baseEnv,
      NODE_ENV: 'production',
      DB_SYNCHRONIZE: 'true',
      DB_LOGGING: 'false',
    });

    await expect(typeOrmConfig(cs)).rejects.toThrow(/FATAL/);
  });

  it('forces synchronize=false in production even when env is unset', async () => {
    const cs = buildConfigService({
      ...baseEnv,
      NODE_ENV: 'production',
      DB_SYNCHRONIZE: 'false',
      DB_LOGGING: 'false',
    });

    const cfg = await typeOrmConfig(cs);
    expect(cfg.synchronize).toBe(false);
  });

  it('respects DB_SYNCHRONIZE=true outside production', async () => {
    const cs = buildConfigService({
      ...baseEnv,
      NODE_ENV: 'development',
      DB_SYNCHRONIZE: 'true',
      DB_LOGGING: 'false',
    });

    const cfg = await typeOrmConfig(cs);
    expect(cfg.synchronize).toBe(true);
  });

  it('enables logging only when DB_LOGGING=true', async () => {
    const onCs = buildConfigService({
      ...baseEnv,
      NODE_ENV: 'development',
      DB_SYNCHRONIZE: 'false',
      DB_LOGGING: 'true',
    });
    const offCs = buildConfigService({
      ...baseEnv,
      NODE_ENV: 'development',
      DB_SYNCHRONIZE: 'false',
      DB_LOGGING: 'false',
    });

    expect((await typeOrmConfig(onCs)).logging).toBe(true);
    expect((await typeOrmConfig(offCs)).logging).toBe(false);
  });
});

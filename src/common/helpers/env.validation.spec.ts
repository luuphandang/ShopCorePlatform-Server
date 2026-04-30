import 'reflect-metadata';

import { envValidation } from './env.validation';

const baseDevConfig: Record<string, unknown> = {
  NODE_ENV: 'development',
  PORT: 3670,
  CROSS_ORIGIN: 'http://localhost:3671',
  RABBITMQ_URI: 'amqp://localhost',
  DB_HOST: 'localhost',
  DB_PORT: 5432,
  DB_USER: 'postgres',
  DB_NAME: 'shopcore',
  DB_SCHEMA: 'public',
  DB_SYNCHRONIZE: 'false',
  DB_LOGGING: 'false',
  DB_MIGRATIONS_RUN: 'true',
  DEFAULT_PAGE: 1,
  DEFAULT_PAGE_SIZE: 10,
  GRAPHQL_PLAYGROUND: 'true',
  JWT_ACCESS_PUBLIC_KEY: 'dev-access-public',
  JWT_ACCESS_PRIVATE_KEY: 'dev-access-private',
  JWT_REFRESH_PUBLIC_KEY: 'dev-refresh-public',
  JWT_REFRESH_PRIVATE_KEY: 'dev-refresh-private',
};

const baseProdConfig: Record<string, unknown> = {
  ...baseDevConfig,
  NODE_ENV: 'production',
  DB_PASSWORD: 'super-secret-password',
  COOKIE_DOMAIN: '.shopcore.example.com',
  AWS_S3_REGION: 'ap-southeast-1',
  AWS_S3_BUCKET_NAME: 'shopcore-prod',
  REDIS_HOST: 'redis.internal',
  REDIS_PORT: 6379,
  METRICS_USER: 'prom',
  METRICS_PASSWORD: 'prom-secret',
};

function omit(source: Record<string, unknown>, key: string): Record<string, unknown> {
  const next = { ...source };
  delete next[key];
  return next;
}

describe('envValidation', () => {
  describe('development', () => {
    it('passes with minimal dev config (no DB_PASSWORD, no AWS, no COOKIE_DOMAIN, no Redis, no metrics)', () => {
      expect(() => envValidation(baseDevConfig)).not.toThrow();
    });

    it('passes when DB_PASSWORD is missing in dev', () => {
      expect(() => envValidation(omit(baseDevConfig, 'DB_PASSWORD'))).not.toThrow();
    });

    it('passes when COOKIE_DOMAIN is missing in dev', () => {
      expect(() => envValidation(omit(baseDevConfig, 'COOKIE_DOMAIN'))).not.toThrow();
    });

    it('allows DB_SYNCHRONIZE=true in dev', () => {
      expect(() => envValidation({ ...baseDevConfig, DB_SYNCHRONIZE: 'true' })).not.toThrow();
    });
  });

  describe('production', () => {
    it('passes with valid full prod config', () => {
      expect(() => envValidation(baseProdConfig)).not.toThrow();
    });

    it('throws when DB_PASSWORD is missing in prod', () => {
      expect(() => envValidation(omit(baseProdConfig, 'DB_PASSWORD'))).toThrow(/DB_PASSWORD/);
    });

    it('throws when AWS_S3_BUCKET_NAME is missing in prod', () => {
      expect(() => envValidation(omit(baseProdConfig, 'AWS_S3_BUCKET_NAME'))).toThrow(
        /AWS_S3_BUCKET_NAME/,
      );
    });

    it('throws when AWS_S3_REGION is missing in prod', () => {
      expect(() => envValidation(omit(baseProdConfig, 'AWS_S3_REGION'))).toThrow(/AWS_S3_REGION/);
    });

    it('throws when COOKIE_DOMAIN is missing in prod', () => {
      expect(() => envValidation(omit(baseProdConfig, 'COOKIE_DOMAIN'))).toThrow(/COOKIE_DOMAIN/);
    });

    it('throws when COOKIE_DOMAIN does not match production regex (localhost)', () => {
      expect(() => envValidation({ ...baseProdConfig, COOKIE_DOMAIN: 'localhost' })).toThrow(
        /COOKIE_DOMAIN/,
      );
    });

    it('throws when COOKIE_DOMAIN does not match production regex (no leading dot)', () => {
      expect(() =>
        envValidation({ ...baseProdConfig, COOKIE_DOMAIN: 'shopcore.example.com' }),
      ).toThrow(/COOKIE_DOMAIN/);
    });

    it('throws when DB_SYNCHRONIZE=true in prod', () => {
      expect(() => envValidation({ ...baseProdConfig, DB_SYNCHRONIZE: 'true' })).toThrow(
        /DB_SYNCHRONIZE/,
      );
    });

    it('throws when REDIS_HOST is missing in prod', () => {
      expect(() => envValidation(omit(baseProdConfig, 'REDIS_HOST'))).toThrow(/REDIS_HOST/);
    });

    it('throws when METRICS_USER is missing in prod', () => {
      expect(() => envValidation(omit(baseProdConfig, 'METRICS_USER'))).toThrow(/METRICS_USER/);
    });

    it('allows AWS_S3_ACCESS_KEY/SECRET_KEY missing in prod (IAM role mode)', () => {
      expect(() => envValidation(baseProdConfig)).not.toThrow();
    });
  });

  describe('cross-environment', () => {
    it('throws when JWT_ACCESS_PUBLIC_KEY is missing (any env)', () => {
      expect(() => envValidation(omit(baseDevConfig, 'JWT_ACCESS_PUBLIC_KEY'))).toThrow(
        /JWT_ACCESS_PUBLIC_KEY/,
      );
    });

    it('throws when NODE_ENV is not in the allowed enum', () => {
      expect(() => envValidation({ ...baseDevConfig, NODE_ENV: 'qa' })).toThrow(/NODE_ENV/);
    });

    it('aggregates multiple errors into one message', () => {
      const cfg = omit(omit(baseProdConfig, 'DB_PASSWORD'), 'COOKIE_DOMAIN');
      expect(() => envValidation(cfg)).toThrow(/DB_PASSWORD[\s\S]*COOKIE_DOMAIN/);
    });
  });
});

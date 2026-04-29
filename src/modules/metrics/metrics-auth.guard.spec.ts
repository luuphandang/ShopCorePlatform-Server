import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';

import { EnvironmentVariables } from '@/common/helpers/env.validation';

import { MetricsAuthGuard } from './metrics-auth.guard';

const buildContext = (headers: Record<string, string> = {}): ExecutionContext =>
  ({
    switchToHttp: () => ({
      getRequest: () => ({ headers }) as unknown as Request,
    }),
  }) as unknown as ExecutionContext;

const buildConfig = (env: Partial<EnvironmentVariables>): ConfigService<EnvironmentVariables> =>
  ({
    get: <K extends keyof EnvironmentVariables>(key: K) => env[key],
  }) as unknown as ConfigService<EnvironmentVariables>;

describe('MetricsAuthGuard', () => {
  const ORIGINAL_NODE_ENV = process.env.NODE_ENV;

  afterEach(() => {
    process.env.NODE_ENV = ORIGINAL_NODE_ENV;
  });

  it('allows access in non-production when credentials are not configured', () => {
    process.env.NODE_ENV = 'development';
    const guard = new MetricsAuthGuard(buildConfig({}));

    expect(guard.canActivate(buildContext())).toBe(true);
  });

  it('denies access in production when credentials are not configured', () => {
    process.env.NODE_ENV = 'production';
    const guard = new MetricsAuthGuard(buildConfig({}));

    expect(() => guard.canActivate(buildContext())).toThrow(UnauthorizedException);
  });

  it('rejects requests without basic auth header', () => {
    const guard = new MetricsAuthGuard(
      buildConfig({ METRICS_USER: 'admin', METRICS_PASSWORD: 'pwd' }),
    );

    expect(() => guard.canActivate(buildContext())).toThrow(UnauthorizedException);
  });

  it('accepts valid credentials', () => {
    const guard = new MetricsAuthGuard(
      buildConfig({ METRICS_USER: 'admin', METRICS_PASSWORD: 'pwd' }),
    );
    const encoded = Buffer.from('admin:pwd').toString('base64');

    expect(guard.canActivate(buildContext({ authorization: `Basic ${encoded}` }))).toBe(true);
  });

  it('rejects invalid credentials', () => {
    const guard = new MetricsAuthGuard(
      buildConfig({ METRICS_USER: 'admin', METRICS_PASSWORD: 'pwd' }),
    );
    const encoded = Buffer.from('admin:wrong').toString('base64');

    expect(() => guard.canActivate(buildContext({ authorization: `Basic ${encoded}` }))).toThrow(
      UnauthorizedException,
    );
  });

  it('rejects malformed base64 payload', () => {
    const guard = new MetricsAuthGuard(
      buildConfig({ METRICS_USER: 'admin', METRICS_PASSWORD: 'pwd' }),
    );
    const encoded = Buffer.from('no-colon-here').toString('base64');

    expect(() => guard.canActivate(buildContext({ authorization: `Basic ${encoded}` }))).toThrow(
      UnauthorizedException,
    );
  });
});

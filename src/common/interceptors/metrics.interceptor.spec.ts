import { CallHandler, ExecutionContext } from '@nestjs/common';
import { register } from 'prom-client';
import { firstValueFrom, of, throwError } from 'rxjs';

import { httpRequestDuration } from '@/modules/metrics/metrics.registry';

import { MetricsInterceptor } from './metrics.interceptor';

const httpContext = (
  req: Record<string, unknown>,
  res: Record<string, unknown>,
): ExecutionContext =>
  ({
    getType: () => 'http',
    switchToHttp: () => ({
      getRequest: () => req,
      getResponse: () => res,
    }),
  } as unknown as ExecutionContext);

describe('MetricsInterceptor', () => {
  const interceptor = new MetricsInterceptor();

  beforeEach(() => {
    register.resetMetrics();
  });

  it('observes http_request_duration_seconds with success label on next', async () => {
    const next: CallHandler = { handle: () => of('ok') };

    await firstValueFrom(
      interceptor.intercept(
        httpContext(
          { method: 'GET', route: { path: '/health/liveness' }, path: '/health/liveness' },
          { statusCode: 200 },
        ),
        next,
      ),
    );

    const metric = (await httpRequestDuration.get()).values;
    const success = metric.filter(
      (v) => v.labels.method === 'GET' && v.labels.route === '/health/liveness',
    );
    expect(success.length).toBeGreaterThan(0);
    expect(success.some((v) => v.labels.status === 'success')).toBe(true);
  });

  it('observes error label when downstream throws', async () => {
    const next: CallHandler = {
      handle: () => throwError(() => new Error('boom')),
    };

    await expect(
      firstValueFrom(
        interceptor.intercept(
          httpContext(
            { method: 'POST', route: { path: '/users' }, path: '/users' },
            { statusCode: 500 },
          ),
          next,
        ),
      ),
    ).rejects.toThrow('boom');

    const metric = (await httpRequestDuration.get()).values;
    expect(metric.some((v) => v.labels.status === 'error')).toBe(true);
  });

  it('skips non-http contexts', async () => {
    const next: CallHandler = { handle: () => of('skip') };
    const ctx = { getType: () => 'graphql' } as unknown as ExecutionContext;

    const result = await firstValueFrom(interceptor.intercept(ctx, next));

    expect(result).toBe('skip');
    const metric = (await httpRequestDuration.get()).values;
    expect(metric.length).toBe(0);
  });
});

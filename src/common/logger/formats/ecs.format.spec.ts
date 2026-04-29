import type { TransformableInfo } from 'logform';

import { ecsFormat } from './ecs.format';

const apply = (info: Record<string, unknown>): Record<string, unknown> =>
  ecsFormat().transform({ ...info } as unknown as TransformableInfo, {}) as Record<string, unknown>;

describe('ecsFormat', () => {
  it('renames standard fields to ECS names', () => {
    const out = apply({
      timestamp: '2026-04-30T10:00:00.000Z',
      level: 'info',
      message: 'hello',
    });

    expect(out['@timestamp']).toBe('2026-04-30T10:00:00.000Z');
    expect(out['log.level']).toBe('info');
    expect(out.message).toBe('hello');
    expect(out['service.name']).toBe('shopcore-server');
  });

  it('maps NestJS context to log.logger and stack to error.stack_trace', () => {
    const out = apply({
      timestamp: 't',
      level: 'error',
      message: 'boom',
      context: 'AuthService',
      stack: 'Error: boom\n  at ...',
    });

    expect(out['log.logger']).toBe('AuthService');
    expect(out['error.stack_trace']).toBe('Error: boom\n  at ...');
    expect(out.context).toBeUndefined();
    expect(out.stack).toBeUndefined();
  });

  it('promotes requestId/userId to ECS trace fields', () => {
    const out = apply({
      timestamp: 't',
      level: 'info',
      message: 'm',
      requestId: 'req-123',
      userId: 7,
    });

    expect(out['trace.id']).toBe('req-123');
    expect(out['user.id']).toBe(7);
  });

  it('omits trace.id and user.id when context is empty', () => {
    const out = apply({
      timestamp: 't',
      level: 'info',
      message: 'm',
    });

    expect(out['trace.id']).toBeUndefined();
    expect(out['user.id']).toBeUndefined();
  });

  it('preserves arbitrary extra fields', () => {
    const out = apply({
      timestamp: 't',
      level: 'info',
      message: 'm',
      durationMs: 42,
      route: '/health',
    });

    expect(out.durationMs).toBe(42);
    expect(out.route).toBe('/health');
  });
});

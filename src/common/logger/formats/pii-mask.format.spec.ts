import type { TransformableInfo } from 'logform';

import { piiMaskFormat } from './pii-mask.format';

const apply = (info: Record<string, unknown>): Record<string, unknown> =>
  piiMaskFormat().transform({ ...info } as unknown as TransformableInfo, {}) as Record<
    string,
    unknown
  >;

describe('piiMaskFormat', () => {
  it('redacts password, token, authorization, cookie, secret', () => {
    const out = apply({
      level: 'info',
      message: 'login',
      password: 'super-secret',
      token: 'jwt.eyJhbG',
      authorization: 'Bearer abc',
      cookie: 'session=xyz',
      apiSecret: 'sk_live_123',
    });

    expect(out).toMatchObject({
      password: '[REDACTED]',
      token: '[REDACTED]',
      authorization: '[REDACTED]',
      cookie: '[REDACTED]',
      apiSecret: '[REDACTED]',
    });
  });

  it('matches creditCard variations', () => {
    const out = apply({
      level: 'info',
      message: 'pay',
      creditCard: '4111-1111-1111-1111',
      credit_card_number: '4111111111111111',
    });

    expect(out.creditCard).toBe('[REDACTED]');
    expect(out.credit_card_number).toBe('[REDACTED]');
  });

  it('redacts PII keys nested in objects and arrays', () => {
    const out = apply({
      level: 'info',
      message: 'register',
      user: {
        name: 'Alice',
        password: 'pwd',
        details: { token: 't1' },
      },
      events: [{ password: 'p1' }, { password: 'p2' }],
    });

    expect((out.user as Record<string, unknown>).password).toBe('[REDACTED]');
    expect(((out.user as Record<string, unknown>).details as Record<string, unknown>).token).toBe(
      '[REDACTED]',
    );
    expect((out.events as Array<Record<string, unknown>>)[0].password).toBe('[REDACTED]');
    expect((out.events as Array<Record<string, unknown>>)[1].password).toBe('[REDACTED]');
  });

  it('masks emails inside string values', () => {
    const out = apply({
      level: 'info',
      message: 'sent welcome to alice@example.com',
      note: 'cc bob.smith@corp.example.co',
    });

    expect(out.message).toBe('sent welcome to alice@***');
    expect(out.note).toBe('cc bob.smith@***');
  });

  it('preserves non-PII fields untouched', () => {
    const out = apply({
      level: 'info',
      message: 'plain',
      userId: 42,
      count: 7,
    });

    expect(out.userId).toBe(42);
    expect(out.count).toBe(7);
  });

  it('handles circular references without throwing', () => {
    const ref: Record<string, unknown> = { name: 'loop' };
    ref.self = ref;

    expect(() =>
      apply({
        level: 'info',
        message: 'cycle',
        ref,
      }),
    ).not.toThrow();
  });
});

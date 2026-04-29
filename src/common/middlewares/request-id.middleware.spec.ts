import { NextFunction, Request, Response } from 'express';

import { getRequestContext } from '@/common/contexts/request.context';

import { RequestIdMiddleware } from './request-id.middleware';

const buildReq = (headers: Record<string, string | string[]> = {}): Request =>
  ({ headers }) as unknown as Request;

const buildRes = () => {
  const setHeader = jest.fn();
  return {
    res: { setHeader } as unknown as Response,
    setHeader,
  };
};

describe('RequestIdMiddleware', () => {
  const middleware = new RequestIdMiddleware();

  it('echoes a safe incoming x-request-id and stores it in ALS', (done) => {
    const req = buildReq({ 'x-request-id': 'trace-abc.123' });
    const { res, setHeader } = buildRes();

    const next: NextFunction = () => {
      const ctx = getRequestContext();
      try {
        expect(ctx?.requestId).toBe('trace-abc.123');
        expect(setHeader).toHaveBeenCalledWith('x-request-id', 'trace-abc.123');
        done();
      } catch (err) {
        done(err);
      }
    };

    middleware.use(req, res, next);
  });

  it('generates a UUID when no header is present', (done) => {
    const req = buildReq({});
    const { res, setHeader } = buildRes();

    const next: NextFunction = () => {
      const ctx = getRequestContext();
      try {
        expect(ctx?.requestId).toMatch(
          /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
        );
        expect(setHeader).toHaveBeenCalledWith('x-request-id', ctx?.requestId);
        done();
      } catch (err) {
        done(err);
      }
    };

    middleware.use(req, res, next);
  });

  it('rejects unsafe incoming header and falls back to UUID', (done) => {
    const req = buildReq({ 'x-request-id': 'bad value with spaces!' });
    const { res } = buildRes();

    const next: NextFunction = () => {
      const ctx = getRequestContext();
      try {
        expect(ctx?.requestId).not.toBe('bad value with spaces!');
        expect(ctx?.requestId).toMatch(/^[0-9a-f-]{36}$/i);
        done();
      } catch (err) {
        done(err);
      }
    };

    middleware.use(req, res, next);
  });

  it('isolates contexts between concurrent requests', async () => {
    const run = (incoming: string) =>
      new Promise<string | undefined>((resolve) => {
        const req = buildReq({ 'x-request-id': incoming });
        const { res } = buildRes();
        middleware.use(req, res, () => {
          setImmediate(() => resolve(getRequestContext()?.requestId));
        });
      });

    const [a, b] = await Promise.all([run('req-a.1'), run('req-b.2')]);

    expect(a).toBe('req-a.1');
    expect(b).toBe('req-b.2');
  });
});

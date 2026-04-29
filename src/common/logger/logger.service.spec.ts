import { format } from 'winston';

import { requestContextStorage } from '@/common/contexts/request.context';

import { ecsFormat } from './formats/ecs.format';
import { requestContextFormat } from './logger.service';

describe('AppLogger ALS → ECS chain', () => {
  const runChain = (input: Record<string, unknown>): Record<string, unknown> => {
    const combined = format.combine(requestContextFormat(), ecsFormat());
    const result = combined.transform({ ...input } as never, {});
    return result as Record<string, unknown>;
  };

  it('renders trace.id from a requestId set in the ALS store', () => {
    const captured = requestContextStorage.run({ requestId: 'req-abc' }, () =>
      runChain({ timestamp: 't', level: 'info', message: 'm' }),
    );

    expect(captured['trace.id']).toBe('req-abc');
    expect(captured.requestId).toBeUndefined();
  });

  it('renders user.id when ALS store includes userId', () => {
    const captured = requestContextStorage.run({ requestId: 'req-xyz', userId: 42 }, () =>
      runChain({ timestamp: 't', level: 'info', message: 'm' }),
    );

    expect(captured['trace.id']).toBe('req-xyz');
    expect(captured['user.id']).toBe(42);
  });

  it('omits trace.id outside any ALS run scope', () => {
    const captured = runChain({ timestamp: 't', level: 'info', message: 'm' });

    expect(captured['trace.id']).toBeUndefined();
    expect(captured['user.id']).toBeUndefined();
  });
});

const mockInc = jest.fn();
const mockLabels = jest.fn((..._args: string[]) => ({ inc: mockInc }));

jest.mock('@/modules/metrics/metrics.registry', () => ({
  rabbitmqMessagesTotal: { labels: mockLabels },
}));

import { requestContextStorage } from '@/common/contexts/request.context';

import { RabbitMQService } from './rabbitmq.service';

describe('RabbitMQService.publish', () => {
  type PublishArgs = [string, string, Buffer, { headers: Record<string, string | undefined> }?];
  const buildHarness = (publishReturn: boolean | Error = true) => {
    const publish = jest.fn<boolean, PublishArgs>(() => {
      if (publishReturn instanceof Error) throw publishReturn;
      return publishReturn;
    });
    const channel = {
      assertExchange: jest.fn().mockResolvedValue(undefined),
      publish,
    };

    const fakeThis = {
      channel,
      rabbitConfig: { exchangeOptions: { durable: true } },
      waitForReady: jest.fn().mockResolvedValue(undefined),
    } as unknown as RabbitMQService;

    return { channel, fakeThis };
  };

  beforeEach(() => {
    mockInc.mockClear();
    mockLabels.mockClear();
  });

  it('attaches x-request-id from the ALS store and increments success counter', async () => {
    const { channel, fakeThis } = buildHarness(true);

    const ok = await requestContextStorage.run({ requestId: 'req-123' }, () =>
      RabbitMQService.prototype.publish.call(fakeThis, 'orders', 'order.created', { id: 1 }),
    );

    expect(ok).toBe(true);
    expect(channel.publish).toHaveBeenCalledTimes(1);
    const [exchange, routingKey, payload, opts] = channel.publish.mock.calls[0];
    expect(exchange).toBe('orders');
    expect(routingKey).toBe('order.created');
    expect(JSON.parse(payload.toString())).toEqual({ id: 1 });
    expect(opts?.headers?.['x-request-id']).toBe('req-123');
    expect(mockLabels).toHaveBeenCalledWith('publish', 'order.created', 'success');
    expect(mockInc).toHaveBeenCalledTimes(1);
  });

  it('preserves caller-provided x-request-id over the ALS value', async () => {
    const { channel, fakeThis } = buildHarness(true);

    await requestContextStorage.run({ requestId: 'req-from-als' }, () =>
      RabbitMQService.prototype.publish.call(fakeThis, 'orders', 'order.created', {}, 'direct', {
        headers: { 'x-request-id': 'req-explicit' },
      }),
    );

    const opts = channel.publish.mock.calls[0][3];
    expect(opts?.headers?.['x-request-id']).toBe('req-explicit');
  });

  it('records buffered status when channel reports backpressure', async () => {
    const { fakeThis } = buildHarness(false);

    const ok = await RabbitMQService.prototype.publish.call(
      fakeThis,
      'orders',
      'order.created',
      {},
    );

    expect(ok).toBe(false);
    expect(mockLabels).toHaveBeenCalledWith('publish', 'order.created', 'buffered');
  });

  it('records error status and rethrows when publish throws', async () => {
    const { fakeThis } = buildHarness(new Error('channel closed'));

    await expect(
      RabbitMQService.prototype.publish.call(fakeThis, 'orders', 'order.created', {}),
    ).rejects.toThrow('channel closed');

    expect(mockLabels).toHaveBeenCalledWith('publish', 'order.created', 'error');
  });

  it('omits x-request-id when no ALS scope is active', async () => {
    const { channel, fakeThis } = buildHarness(true);

    await RabbitMQService.prototype.publish.call(fakeThis, 'orders', 'order.created', {});

    const opts = channel.publish.mock.calls[0][3];
    expect(opts?.headers?.['x-request-id']).toBeUndefined();
  });
});

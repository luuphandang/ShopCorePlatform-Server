import { Inject, Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ChannelModel, ConfirmChannel, connect, ConsumeMessage } from 'amqplib';
import { firstValueFrom, map, Observable, take, timeout as rxTimeout } from 'rxjs';

import { rabbitmqMessagesTotal } from '@/modules/metrics/metrics.registry';
import { getRequestContext } from '@/common/contexts/request.context';

import { AbstractBase } from '../abstracts/base.abstract';
import { MODULE_CONFIGS } from '../constants/module.constant';
import { CoreContext } from '../contexts';
import { RabbitMQModuleOptions } from './rabbitmq.module';

@Injectable()
export class RabbitMQService extends AbstractBase implements OnModuleInit, OnModuleDestroy {
  private connection: ChannelModel | null = null;
  private channel: ConfirmChannel | null = null;
  private rabbitConfig: RabbitMQModuleOptions;
  private readyPromise: Promise<void>;

  constructor(
    coreContext: CoreContext,
    @Inject(MODULE_CONFIGS.RABBITMQ) rabbitConfig: RabbitMQModuleOptions,
  ) {
    super(coreContext);

    this.rabbitConfig = rabbitConfig;
    this.readyPromise = this.initialize();
  }

  private async initialize(): Promise<void> {
    if (!this.connection) {
      this.connection = await connect(this.rabbitConfig.uri);
      this.channel = await this.connection.createConfirmChannel();

      if (this.rabbitConfig.prefetchCount) {
        await this.channel.prefetch(this.rabbitConfig.prefetchCount);
      }

      this.connection.on('close', () => {
        this.logger.error(
          'RabbitMQ connection closed! Reconnecting...',
          `${this.className}:initialize`,
        );
        this.retry(
          () => !this.connection && this.initialize(),
          this.rabbitConfig.maxReconnectAttempts,
          this.rabbitConfig.reconnectDelay,
        );
      });

      this.connection.on('error', (err) => {
        this.logger.error(err.message, `${this.className}:initialize`);
      });

      this.logger.log(`RabbitMQ connected!`, `${this.className}:initialize`);
    }
  }

  async onModuleInit() {
    await this.readyPromise;
  }

  async onModuleDestroy() {
    if (this.channel) await this.channel.close();
    if (this.connection) await this.connection.close();
  }

  async waitForReady(): Promise<void> {
    await this.readyPromise;
  }

  async isHealthy(timeoutMs = 3000): Promise<boolean> {
    try {
      await Promise.race([
        this.waitForReady(),
        new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error('rabbitmq ready timeout')), timeoutMs),
        ),
      ]);

      if (!this.channel) return false;

      await this.channel.checkExchange('amq.direct');
      return true;
    } catch {
      return false;
    }
  }

  async publish(
    exchange: string,
    routingKey: string,
    message: unknown,
    type: 'direct' | 'topic' | 'fanout' = 'direct',
    publishOptions: { headers?: Record<string, string | undefined> } = {},
  ) {
    await this.waitForReady();

    const exchangeOptions = this.rabbitConfig.exchangeOptions || { durable: true };
    await this.channel.assertExchange(exchange, type, exchangeOptions);

    try {
      const ok = this.channel.publish(exchange, routingKey, Buffer.from(JSON.stringify(message)));
      rabbitmqMessagesTotal.labels('publish', routingKey, ok ? 'success' : 'buffered').inc();
      return ok;
    } catch (error) {
      rabbitmqMessagesTotal.labels('publish', routingKey, 'error').inc();
      throw error;
    }
    const ctx = getRequestContext();
    const headers: Record<string, string | undefined> = { ...(publishOptions.headers ?? {}) };
    if (ctx?.requestId && !headers['x-request-id']) {
      headers['x-request-id'] = ctx.requestId;
    }

    return this.channel.publish(exchange, routingKey, Buffer.from(JSON.stringify(message)), {
      headers,
    });
  }

  async request<T = unknown>(
    exchange: string,
    routingKey: string,
    message: unknown,
    type: 'direct' | 'topic' | 'fanout' = 'direct',
    timeout = 5000,
  ): Promise<T> {
    await this.waitForReady();

    const correlationId = this.util.getRandomUUID;
    const exchangeOptions = this.rabbitConfig.exchangeOptions || { durable: true };

    await this.channel.assertExchange(exchange, type, exchangeOptions);
    const replyQueue = await this.channel.assertQueue('', { exclusive: true });

    const q = await this.channel.assertQueue(routingKey, { durable: true });
    if (!q.consumerCount) throw new Error(`No consumer found for queue ${routingKey}`);

    const reply = new Observable<ConsumeMessage>((subscriber) => {
      let consumerTag: string;

      this.channel
        .consume(
          replyQueue.queue,
          (msg: ConsumeMessage) => {
            if (!msg) return;
            if (msg.properties.correlationId === correlationId) {
              subscriber.next(msg);
              subscriber.complete();
            }
          },
          { noAck: true },
        )
        .then((res) => {
          consumerTag = res.consumerTag;

          this.channel.publish(exchange, routingKey, Buffer.from(JSON.stringify(message)), {
            replyTo: replyQueue.queue,
            correlationId,
          });
        });

      return async () => {
        if (consumerTag) await this.channel.cancel(consumerTag);
        await this.channel.deleteQueue(replyQueue.queue);
      };
    });

    return firstValueFrom(
      reply.pipe(
        take(1),
        map((msg: ConsumeMessage) => JSON.parse(msg.content.toString())),
        rxTimeout({ first: timeout }),
      ),
    );
  }

  async consume(
    exchange: string,
    queue: string,
    routingKey: string,
    handler: (msg: unknown) => void,
    type: 'direct' | 'topic' | 'fanout' = 'direct',
  ) {
    await this.waitForReady();

    const exchangeOptions = this.rabbitConfig.exchangeOptions || { durable: true };
    const queueOptions = this.rabbitConfig.queueOptions || { durable: true };

    await this.channel.assertExchange(exchange, type, exchangeOptions);
    const q = await this.channel.assertQueue(queue, queueOptions);
    await this.channel.bindQueue(q.queue, exchange, type === 'fanout' ? '' : routingKey);

    this.channel.consume(q.queue, (msg: ConsumeMessage) => {
      if (!msg) return;

      try {
        const content = JSON.parse(msg.content.toString());
        handler(content);
        this.channel.ack(msg);
      } catch (error) {
        this.logger.error(error.message, `${this.className}:consume`);
        this.channel.nack(msg, false, false);
      }
    });
  }

  async consumeRPC(
    exchange: string,
    queue: string,
    routingKey: string,
    handler: (msg: unknown) => Promise<unknown> | unknown,
    type: 'direct' | 'topic' | 'fanout' = 'direct',
  ) {
    await this.waitForReady();

    const exchangeOptions = this.rabbitConfig.exchangeOptions || { durable: true };
    const queueOptions = this.rabbitConfig.queueOptions || { durable: true };

    await this.channel.assertExchange(exchange, type, exchangeOptions);
    const q = await this.channel.assertQueue(queue, queueOptions);
    await this.channel.bindQueue(q.queue, exchange, type === 'fanout' ? '' : routingKey);

    this.channel.consume(q.queue, async (msg: ConsumeMessage) => {
      if (!msg) return;

      try {
        const content = JSON.parse(msg.content.toString());
        const result = await handler(content);

        if (msg.properties.replyTo) {
          this.channel.sendToQueue(msg.properties.replyTo, Buffer.from(JSON.stringify(result)), {
            correlationId: msg.properties.correlationId,
          });
        }

        this.channel.ack(msg);
      } catch (error) {
        if (msg.properties.replyTo) {
          this.channel.sendToQueue(
            msg.properties.replyTo,
            Buffer.from(JSON.stringify({ error: error.message })),
            { correlationId: msg.properties.correlationId },
          );
        }
        this.channel.ack(msg);
      }
    });
  }
}

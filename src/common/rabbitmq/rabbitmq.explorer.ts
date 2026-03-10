import { Injectable, OnModuleInit } from '@nestjs/common';
import { DiscoveryService, MetadataScanner, Reflector } from '@nestjs/core';

import { RABBIT_EVENT_METADATA, RABBIT_RPC_METADATA } from './rabbitmq.decorator';
import { RabbitMQService } from './rabbitmq.service';

@Injectable()
export class RabbitExplorer implements OnModuleInit {
  constructor(
    private readonly discovery: DiscoveryService,
    private readonly metadataScanner: MetadataScanner,
    private readonly reflector: Reflector,
    private readonly rabbitMQService: RabbitMQService,
  ) {}

  async onModuleInit() {
    await this.waitForRabbitMQService();

    const providers = this.discovery.getControllers();

    for (const wrapper of providers) {
      const { instance } = wrapper;
      if (!instance) continue;

      this.metadataScanner.scanFromPrototype(instance, Object.getPrototypeOf(instance), (key) => {
        const method = instance[key];

        // Event consumer
        const eventMeta = Reflect.getMetadata(RABBIT_EVENT_METADATA, method);
        if (eventMeta) {
          this.rabbitMQService.consume(
            eventMeta.exchange,
            eventMeta.queue ?? `${eventMeta.exchange}_${eventMeta.routingKey ?? 'queue'}`,
            eventMeta.routingKey ?? '',
            async (msg) => {
              await method.call(instance, msg);
            },
            eventMeta.type ?? 'direct',
          );
        }

        // RPC consumer
        const rpcMeta = Reflect.getMetadata(RABBIT_RPC_METADATA, method);
        if (rpcMeta) {
          this.rabbitMQService.consumeRPC(
            rpcMeta.exchange,
            rpcMeta.queue ?? `${rpcMeta.exchange}_${rpcMeta.routingKey ?? 'rpc'}`,
            rpcMeta.routingKey ?? '',
            async (msg) => {
              return await method.call(instance, msg);
            },
            rpcMeta.type ?? 'direct',
          );
        }
      });
    }
  }

  private async waitForRabbitMQService(): Promise<void> {
    const maxAttempts = 50;
    let attempts = 0;

    while (attempts < maxAttempts) {
      try {
        if (this.rabbitMQService && typeof this.rabbitMQService.publish === 'function') {
          return;
        }
      } catch (error) {
        console.log('RabbitMQService is not ready yet', error);
      }

      await new Promise((resolve) => setTimeout(resolve, 100));
      attempts++;
    }

    throw new Error('RabbitMQService did not become ready within the expected time');
  }
}

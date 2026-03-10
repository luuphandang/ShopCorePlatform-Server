import 'reflect-metadata';

export const RABBIT_EVENT_METADATA = Symbol('RABBIT_EVENT_METADATA');
export const RABBIT_RPC_METADATA = Symbol('RABBIT_RPC_METADATA');

export interface RabbitConsumerOptions {
  exchange: string;
  routingKey?: string;
  queue?: string;
  type?: 'direct' | 'topic' | 'fanout';
}

// Event decorator (fire-and-forget)
export function RabbitEvent(options: RabbitConsumerOptions): MethodDecorator {
  return (target, propertyKey, descriptor) => {
    Reflect.defineMetadata(RABBIT_EVENT_METADATA, options, descriptor.value);
    return descriptor;
  };
}

// RPC decorator (request-response)
export function RabbitRPC(options: RabbitConsumerOptions): MethodDecorator {
  return (target, propertyKey, descriptor) => {
    Reflect.defineMetadata(RABBIT_RPC_METADATA, options, descriptor.value);
    return descriptor;
  };
}

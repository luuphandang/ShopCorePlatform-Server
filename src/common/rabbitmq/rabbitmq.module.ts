import { DynamicModule, Global, Module, Provider } from '@nestjs/common';
import { InjectionToken, ModuleMetadata } from '@nestjs/common/interfaces';
import { DiscoveryModule } from '@nestjs/core';

import { MODULE_CONFIGS } from '../constants/module.constant';
import { RabbitExplorer } from './rabbitmq.explorer';
import { RabbitMQService } from './rabbitmq.service';

export interface RabbitMQModuleOptions {
  uri: string;
  prefetchCount?: number;
  reconnectDelay?: number;
  maxReconnectAttempts?: number;
  exchangeOptions?: {
    durable?: boolean;
    autoDelete?: boolean;
  };
  queueOptions?: {
    durable?: boolean;
    exclusive?: boolean;
    autoDelete?: boolean;
  };
}

export interface RabbitMQModuleAsyncOptions extends Pick<ModuleMetadata, 'imports'> {
  inject?: InjectionToken[];
  useFactory: (...args: unknown[]) => Promise<RabbitMQModuleOptions> | RabbitMQModuleOptions;
}

@Global()
@Module({})
export class RabbitMQModule {
  static register(options: RabbitMQModuleOptions): DynamicModule {
    return {
      module: RabbitMQModule,
      imports: [DiscoveryModule],
      providers: [
        {
          provide: MODULE_CONFIGS.RABBITMQ,
          useValue: options,
        },
        RabbitMQService,
        RabbitExplorer,
      ],
      exports: [RabbitMQService],
    };
  }

  static registerAsync(options: RabbitMQModuleAsyncOptions): DynamicModule {
    const asyncProvider: Provider = {
      provide: MODULE_CONFIGS.RABBITMQ,
      useFactory: options.useFactory,
      inject: options.inject || [],
    };

    return {
      module: RabbitMQModule,
      imports: [DiscoveryModule, ...(options.imports || [])],
      providers: [asyncProvider, RabbitMQService, RabbitExplorer],
      exports: [RabbitMQService],
    };
  }
}

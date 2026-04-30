import { Provider } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ModuleRef } from '@nestjs/core';

import { CoreContext } from '../contexts/core.context';
import { ServiceContext } from '../contexts/service.context';
import { AppLogger } from '../logger/logger.service';
import { RabbitMQService } from '../rabbitmq/rabbitmq.service';
import { RedisService } from '../redis/redis.service';
import { UtilService } from '../utils/util.service';

export const createMockAppLogger = () =>
  ({
    log: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    debug: jest.fn(),
    verbose: jest.fn(),
  }) as unknown as AppLogger;

export const createMockConfigService = (overrides: Record<string, unknown> = {}) =>
  ({
    get: jest.fn((key: string) => overrides[key]),
  }) as unknown as ConfigService;

export const createMockUtilService = () =>
  ({
    getEntity: jest.fn().mockReturnValue('test'),
  }) as unknown as UtilService;

export const createMockRabbitMQService = () =>
  ({
    publish: jest.fn().mockResolvedValue(true),
    request: jest.fn().mockResolvedValue({ success: true, data: null }),
  }) as unknown as RabbitMQService;

export const createMockRedisService = () =>
  ({
    get: jest.fn().mockResolvedValue(null),
    set: jest.fn().mockResolvedValue(true),
    del: jest.fn().mockResolvedValue(true),
    delByPattern: jest.fn().mockResolvedValue(true),
  }) as unknown as RedisService;

export const createMockModuleRef = (lookups: Record<string, unknown> = {}) =>
  ({
    get: jest.fn((token: { name?: string } | string) => {
      const name = typeof token === 'string' ? token : (token?.name ?? '');
      return lookups[name] ?? {};
    }),
  }) as unknown as ModuleRef;

export const createMockCoreContext = (): CoreContext =>
  ({
    configService: createMockConfigService(),
    utilService: createMockUtilService(),
    appLogger: createMockAppLogger(),
  }) as unknown as CoreContext;

export interface MockServiceContextOverrides {
  moduleRefLookups?: Record<string, unknown>;
}

export const createMockServiceContext = (
  overrides: MockServiceContextOverrides = {},
): ServiceContext =>
  ({
    core: createMockCoreContext(),
    rabbitMQService: createMockRabbitMQService(),
    redisService: createMockRedisService(),
    moduleRef: createMockModuleRef(overrides.moduleRefLookups),
  }) as unknown as ServiceContext;

export const mockCoreContextProvider = (): Provider => ({
  provide: CoreContext,
  useFactory: createMockCoreContext,
});

export const mockServiceContextProvider = (
  overrides: MockServiceContextOverrides = {},
): Provider => ({
  provide: ServiceContext,
  useFactory: () => createMockServiceContext(overrides),
});

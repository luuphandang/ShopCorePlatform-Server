import { DynamicModule, Global, Module, Provider } from '@nestjs/common';
import { InjectionToken, ModuleMetadata } from '@nestjs/common/interfaces';
import { MODULE_CONFIGS } from '../constants/module.constant';

export interface CustomModuleOptions {
  [key: string]: unknown;
}

export interface CustomModuleAsyncOptions extends Pick<ModuleMetadata, 'imports'> {
  inject?: InjectionToken[];
  useFactory: (...args: unknown[]) => Promise<CustomModuleOptions> | CustomModuleOptions;
}

@Global()
@Module({})
export class CustomModule {
  static register(options: CustomModuleOptions): DynamicModule {
    return {
      module: CustomModule,
      providers: [
        {
          provide: MODULE_CONFIGS.CUSTOM,
          useValue: options,
        },
      ],
      exports: [MODULE_CONFIGS.CUSTOM],
      global: true,
    };
  }

  static registerAsync(options: CustomModuleAsyncOptions): DynamicModule {
    const asyncProvider: Provider = {
      provide: MODULE_CONFIGS.CUSTOM,
      useFactory: options.useFactory,
      inject: options.inject || [],
    };

    return {
      module: CustomModule,
      imports: options.imports || [],
      providers: [asyncProvider],
      exports: [MODULE_CONFIGS.CUSTOM],
      global: true,
    };
  }
}

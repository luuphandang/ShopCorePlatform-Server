import { ConfigService } from '@nestjs/config';

import { EnvironmentVariables } from '../helpers/env.validation';
import { AppLogger } from '../logger/logger.service';
import { UtilService } from '../utils/util.service';

export abstract class AbstractBase {
  private readonly CLASS_NAME = this.constructor.name;

  constructor(
    private readonly configService: ConfigService<EnvironmentVariables>,
    private readonly utilService: UtilService,
    private readonly appLogger: AppLogger,
  ) {}

  protected get className(): string {
    return this.CLASS_NAME;
  }

  protected get config(): IConfig {
    return {
      getString: (key: keyof EnvironmentVariables) => String(this.configService.get<string>(key)),
      getNumber: (key: keyof EnvironmentVariables) => Number(this.configService.get<number>(key)),
    };
  }

  protected get util(): UtilService {
    return this.utilService;
  }

  protected get logger(): ILogger {
    return {
      debug: (message: string, context?: string) =>
        this.appLogger.debug(message, context || this.CLASS_NAME),

      error: (message: string, context?: string) =>
        this.appLogger.error(message, context || this.CLASS_NAME),

      log: (message: string, context?: string) =>
        this.appLogger.log(message, context || this.CLASS_NAME),

      verbose: (message: string, context?: string) =>
        this.appLogger.verbose(message, context || this.CLASS_NAME),

      warn: (message: string, context?: string) =>
        this.appLogger.warn(message, context || this.CLASS_NAME),
    };
  }

  protected async retry<T>(fn: () => Promise<T>, maxRetries = 8, delayMs = 1000): Promise<T> {
    let retries = 0;
    while (retries < maxRetries) {
      try {
        return await fn();
      } catch (err) {
        retries++;
        this.logger.warn(`Retry ${retries}/${maxRetries} failed: ${err.message}`);

        if (retries >= maxRetries) throw err;
        await new Promise((r) => setTimeout(r, delayMs * retries));
      }
    }
  }
}

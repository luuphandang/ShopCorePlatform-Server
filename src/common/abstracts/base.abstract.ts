import { CoreContext } from '../contexts/core.context';
import { EnvironmentVariables } from '../helpers/env.validation';
import { UtilService } from '../utils/util.service';

export abstract class AbstractBase {
  private readonly CLASS_NAME = this.constructor.name;

  constructor(private readonly _coreContext: CoreContext) {}

  protected get className(): string {
    return this.CLASS_NAME;
  }

  protected get config(): IConfig {
    return {
      getString: (key: keyof EnvironmentVariables) =>
        this._coreContext.configService.get<string>(key) ?? '',
      getNumber: (key: keyof EnvironmentVariables) => {
        const value = this._coreContext.configService.get<number>(key);
        return value != null && !isNaN(Number(value)) ? Number(value) : 0;
      },
      getOptionalString: (key: keyof EnvironmentVariables) =>
        this._coreContext.configService.get<string>(key) ?? undefined,
    };
  }

  protected get util(): UtilService {
    return this._coreContext.utilService;
  }

  protected get logger(): ILogger {
    return {
      debug: (message: string, context?: string) =>
        this._coreContext.appLogger.debug(message, context || this.CLASS_NAME),

      error: (message: string, context?: string) =>
        this._coreContext.appLogger.error(message, context || this.CLASS_NAME),

      log: (message: string, context?: string) =>
        this._coreContext.appLogger.log(message, context || this.CLASS_NAME),

      verbose: (message: string, context?: string) =>
        this._coreContext.appLogger.verbose(message, context || this.CLASS_NAME),

      warn: (message: string, context?: string) =>
        this._coreContext.appLogger.warn(message, context || this.CLASS_NAME),
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

import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

import { AbstractBase } from '../abstracts/base.abstract';
import { EnvironmentVariables } from '../helpers/env.validation';
import { AppLogger } from '../logger/logger.service';
import { UtilService } from '../utils/util.service';

@Injectable()
export class HandleRequestInterceptor extends AbstractBase implements NestInterceptor {
  constructor(
    configService: ConfigService<EnvironmentVariables>,
    utilService: UtilService,
    appLogger: AppLogger,
  ) {
    super(configService, utilService, appLogger);
  }

  public intercept(context: ExecutionContext, next: CallHandler<unknown>): Observable<unknown> {
    const timeStart = Date.now();

    const contextArgs = context.getArgs();

    const { fieldName } = contextArgs[3] ?? { fieldName: 'GRAPHQL API' };

    return next.handle().pipe(
      tap(() => {
        const timeHandle = Date.now() - timeStart;
        this.logger.debug(
          `${fieldName} request handle using ${timeHandle}ms`,
          `${this.className}:${fieldName}`,
        );
      }),
    );
  }
}

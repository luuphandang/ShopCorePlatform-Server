import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

import { AbstractBase } from '../abstracts/base.abstract';
import { CoreContext } from '../contexts';

@Injectable()
export class HandleRequestInterceptor extends AbstractBase implements NestInterceptor {
  constructor(coreContext: CoreContext) {
    super(coreContext);
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

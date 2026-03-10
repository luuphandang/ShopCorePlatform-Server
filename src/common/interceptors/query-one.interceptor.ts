import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { CustomBadRequestError } from '../exceptions/bad-request.exception';
import { IQuery } from '../interfaces/graphql-query.interface';

@Injectable()
export class QueryOneInterceptor<T> implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<T> {
    const contextArgs = context.getArgs();
    const { query } = contextArgs[1];

    if (!query) throw new CustomBadRequestError('Query must be not null!');

    this.handleWhereQuery(query);

    return next.handle().pipe(map((data) => data));
  }

  private handleWhereQuery(query: IQuery): void {
    if (!query?.where) throw new CustomBadRequestError('Where option must be not null!');

    query.where = JSON.parse(query.where);
  }
}

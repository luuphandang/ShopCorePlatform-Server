import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { ESortType } from '../enums/common.enum';
import { IQuery } from '../interfaces/graphql-query.interface';

@Injectable()
export class QueryManyInterceptor<T> implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<T> {
    const contextArgs = context.getArgs();
    const query: IQuery = contextArgs[1]?.query ?? {};

    this.handleQuery(query);

    contextArgs[1].query = query;

    return next.handle().pipe(map((data) => data));
  }

  private handleQuery(query: IQuery) {
    this.handleWhereQuery(query);
    this.handlePaginationQuery(query);
    this.handleOrderQuery(query);
  }

  private handleWhereQuery(query: IQuery): void {
    query.where = query?.where ? JSON.parse(query.where) : {};
  }

  private handlePaginationQuery(query: IQuery): void {
    const paginationDefault = { page: 1, limit: 50 };

    query.pagination = query?.pagination
      ? { ...paginationDefault, ...query.pagination }
      : { ...paginationDefault };
  }

  private handleOrderQuery(query: IQuery): void {
    const order = query?.order ? JSON.parse(query.order) : {};

    query.order = { created_at: ESortType.DESC, id: ESortType.DESC, ...order };
  }
}

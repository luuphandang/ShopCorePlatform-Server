import { FindOptionsOrder, FindOptionsRelations, FindOptionsSelect } from 'typeorm';

import { IPagination } from '@/common/graphql/query.input';

import { IWhere } from '../types/where.type';

export interface IRepoQueryOne<T> {
  where?: IWhere<T>;
  select?: FindOptionsSelect<T>;
  relations?: FindOptionsRelations<T>;

  withDeleted?: boolean;
}

export interface IRepoQueryMany<T> extends IRepoQueryOne<T> {
  pagination?: IPagination;
  order?: FindOptionsOrder<T>;
}

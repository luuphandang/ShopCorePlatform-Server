import { BadRequestException, Injectable } from '@nestjs/common';
import {
  Between,
  DataSource,
  DeepPartial,
  FindOperator,
  FindOptionsOrder,
  FindOptionsRelations,
  FindOptionsSelect,
  FindOptionsWhere,
  ILike,
  In,
  IsNull,
  LessThan,
  LessThanOrEqual,
  Like,
  MoreThan,
  MoreThanOrEqual,
  Not,
  Raw,
  Repository,
} from 'typeorm';

import { RepositoryContext } from '../contexts/repository.context';
import { IPagination } from '../graphql/query.input';
import { EPaginationType } from '../enums/common.enum';
import { IWhere } from '../types/where.type';
import { AbstractBase } from './base.abstract';
import { AbstractEntity } from './entity.abstract';

const operatorMap = new Map<string, (val: unknown) => unknown>([
  ['$eq', (val): unknown => val],
  ['$ne', (val): FindOperator<unknown> => Not(val)],
  ['$lt', (val): FindOperator<unknown> => LessThan(val)],
  ['$lte', (val): FindOperator<unknown> => LessThanOrEqual(val)],
  ['$gt', (val): FindOperator<unknown> => MoreThan(val)],
  ['$gte', (val): FindOperator<unknown> => MoreThanOrEqual(val)],
  ['$in', (val): FindOperator<unknown> => In(Array.isArray(val) ? val : [val])],
  ['$nIn', (val): FindOperator<unknown> => Not(In(Array.isArray(val) ? val : [val]))],
  ['$contains', (val): FindOperator<unknown> => Like(`%${val}%`)],
  ['$nContains', (val): FindOperator<unknown> => Not(Like(`%${val}%`))],
  ['$iContains', (val): FindOperator<unknown> => ILike(`%${val}%`)],
  ['$nIContains', (val): FindOperator<unknown> => Not(ILike(`%${val}%`))],
  ['$null', (): FindOperator<unknown> => IsNull()],
  ['$nNull', (): FindOperator<unknown> => Not(IsNull())],
  [
    '$between',
    (val): FindOperator<unknown> => {
      if (!Array.isArray(val) || val.length !== 2) {
        throw new BadRequestException('Invalid $between value, must be [min, max]');
      }
      return Between(val[0], val[1]);
    },
  ],
  [
    '$containsAllInteger',
    (val): FindOperator<unknown> =>
      Raw((alias) => `${alias} @> ARRAY[:...values]::integer[]`, {
        values: val,
      }),
  ],
  [
    '$containsAnyInteger',
    (val): FindOperator<unknown> =>
      Raw((alias) => `${alias} && ARRAY[:...values]::integer[]`, {
        values: val,
      }),
  ],
  [
    '$containsValueInteger',
    (val): FindOperator<unknown> => Raw((alias) => `:value = ANY(${alias})`, { value: val }),
  ],
  [
    '$containsAllString',
    (val): FindOperator<unknown> =>
      Raw((alias) => `${alias} @> ARRAY[:...values]::string[]`, {
        values: val,
      }),
  ],
  [
    '$containsAnyString',
    (val): FindOperator<unknown> =>
      Raw((alias) => `${alias} && ARRAY[:...values]::string[]`, {
        values: val,
      }),
  ],
  [
    '$containsValueString',
    (val): FindOperator<unknown> => Raw((alias) => `:value = ANY(${alias})`, { value: val }),
  ],
]);

@Injectable()
export abstract class AbstractRepository<T extends AbstractEntity> extends AbstractBase {
  constructor(
    private readonly _repoContext: RepositoryContext,
    private readonly _repository: Repository<T>,
  ) {
    super(_repoContext.core);
  }

  public async getOne(
    options: {
      where?: IWhere<T>;
      select?: FindOptionsSelect<T>;
      relations?: FindOptionsRelations<T>;
      withDeleted?: boolean;
    } = {},
  ): Promise<T | null> {
    try {
      const { where = {}, select, relations, withDeleted = false } = options;

      return await this.repository.findOne({
        where: this.applyWhere(where),
        select,
        relations,
        withDeleted,
      });
    } catch (error) {
      this.logger.error(error, `${this.className}:getOne`);
      throw error;
    }
  }

  public async getMany(options: {
    where?: IWhere<T>;
    order?: FindOptionsOrder<T>;
    select?: FindOptionsSelect<T>;
    relations?: FindOptionsRelations<T>;
    withDeleted?: boolean;
  }): Promise<T[]> {
    try {
      const { where = {}, order, select, relations, withDeleted = false } = options || {};

      return await this.repository.find({
        where: { ...this.applyWhere(where) },
        order,
        select,
        relations,
        withDeleted,
      });
    } catch (error) {
      this.logger.error(error, `${this.className}:getMany`);
      throw error;
    }
  }

  public async getPagination(options: {
    where?: IWhere<T>;
    pagination?: IPagination;
    order?: FindOptionsOrder<T>;
    select?: FindOptionsSelect<T>;
    relations?: FindOptionsRelations<T>;
    withDeleted?: boolean;
  }): Promise<{ count: number; data: T[] }> {
    try {
      const {
        where = {},
        pagination: {
          page,
          limit,
          pagination_type: paginationType = EPaginationType.PAGINATION,
        } = {},
        order = { created_at: 'DESC' } as unknown as FindOptionsOrder<T>,
        select,
        relations,
        withDeleted = false,
      } = options || {};
      const [data, count] = await this.repository.findAndCount({
        where: { ...this.applyWhere(where) },
        ...(paginationType === EPaginationType.PAGINATION
          ? { skip: (page - 1) * limit, take: limit }
          : {}),
        order,
        select,
        relations,
        withDeleted,
      });

      return { count, data };
    } catch (error) {
      this.logger.error(error, `${this.className}:getPagination`);
      throw error;
    }
  }

  public async getByIds(ids: number[] = []): Promise<T[]> {
    try {
      return await this.getMany({
        where: { id: { $in: ids } } as unknown as FindOptionsWhere<T>,
        order: { created_at: 'DESC' } as unknown as FindOptionsOrder<T>,
      });
    } catch (error) {
      this.logger.error(error, `${this.className}:getByIds`);
      throw error;
    }
  }

  public build(data: DeepPartial<T>): DeepPartial<T> {
    try {
      return this.repository.create(data);
    } catch (error) {
      this.logger.error(error, `${this.className}:build`);
      throw error;
    }
  }

  public async create(data: DeepPartial<T>): Promise<T> {
    try {
      const entity = this.build(data);

      return await this.repository.save(entity);
    } catch (error) {
      this.logger.error(error, `${this.className}:create`);
      throw error;
    }
  }

  public async bulkCreate(data: DeepPartial<T>[]): Promise<T[]> {
    try {
      const entities = data.map((elm) => this.build(elm));

      return await this.repository.save(entities);
    } catch (error) {
      this.logger.error(error, `${this.className}:bulkCreate`);
      throw error;
    }
  }

  public async update(data: DeepPartial<T>): Promise<T> {
    try {
      const entity = this.build(data);

      return await this.repository.save(entity);
    } catch (error) {
      this.logger.error(error, `${this.className}:update`);
      throw error;
    }
  }

  public async bulkUpdate(data: DeepPartial<T>[]): Promise<T[]> {
    try {
      const entities = data.map((elm) => this.build(elm));

      return await this.repository.save(entities);
    } catch (error) {
      this.logger.error(error, `${this.className}:bulkUpdate`);
      throw error;
    }
  }

  public async softDelete(data: DeepPartial<T>): Promise<T> {
    try {
      const entity = this.build(data);

      return await this.repository.softRemove(entity);
    } catch (error) {
      this.logger.error(error, `${this.className}:softDelete`);
      throw error;
    }
  }

  public async bulkSoftDelete(data: DeepPartial<T>[]): Promise<T[]> {
    try {
      const entities = data.map((elm) => this.build(elm));

      return await this.repository.softRemove(entities);
    } catch (error) {
      this.logger.error(error, `${this.className}:bulkSoftDelete`);
      throw error;
    }
  }

  public async recover(data: DeepPartial<T>): Promise<T> {
    try {
      const entity = this.build(data);

      return await this.repository.recover(entity);
    } catch (error) {
      this.logger.error(error, `${this.className}:recover`);
      throw error;
    }
  }

  public async bulkRecover(data: DeepPartial<T>[]): Promise<T[]> {
    try {
      const entities = data.map((elm) => this.build(elm));

      return await this.repository.recover(entities);
    } catch (error) {
      this.logger.error(error, `${this.className}:bulkRecover`);
      throw error;
    }
  }

  public async hardDelete(data: T): Promise<T> {
    try {
      return await this.repository.remove(data);
    } catch (error) {
      this.logger.error(error, `${this.className}:hardDelete`);
      throw error;
    }
  }

  public async bulkHardDelete(data: T[]): Promise<T[]> {
    try {
      return await this.repository.remove(data);
    } catch (error) {
      this.logger.error(error, `${this.className}:bulkHardDelete`);
      throw error;
    }
  }

  public async executeInTransaction<T>(callback: () => Promise<T>): Promise<T> {
    try {
      return await this.dataSource.transaction(callback);
    } catch (error) {
      this.logger.error(error, `${this.className}:executeInTransaction`);
      throw error;
    }
  }

  // Protected methods

  protected get dataSource(): DataSource {
    return this._repoContext.dataSource;
  }

  protected get repository(): Repository<T> {
    return this._repository;
  }

  // Private methods

  private applyWhere(where: IWhere<T>): FindOptionsWhere<T> {
    const whereOptions: FindOptionsWhere<T> = {};

    for (const [key, value] of Object.entries(where)) {
      if (typeof value === 'object' && value !== null) {
        for (const [operator, val] of Object.entries(value)) {
          if (operatorMap.has(operator)) {
            whereOptions[key] = operatorMap.get(operator)(val);
          }
        }
      } else {
        whereOptions[key] = value;
      }
    }

    return whereOptions;
  }
}

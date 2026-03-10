import { OnModuleInit } from '@nestjs/common';
import { ModuleRef } from '@nestjs/core';
import { DeepPartial, FindOptionsWhere } from 'typeorm';

import { User } from '@/modules/users/entities/user.entity';

import { ServiceContext } from '../contexts/service.context';
import { CustomNotFoundError } from '../exceptions/not-found.exception';
import { MetadataResponse } from '../graphql/metadata.response';
import { IPagination } from '../graphql/query.input';
import { RabbitMQService } from '../rabbitmq/rabbitmq.service';
import { RedisService } from '../redis/redis.service';
import { ACTIONS, RABBITMQ_EVENTS } from '../constants/event.constant';
import { EPaginationType } from '../enums/common.enum';
import { IRepoQueryMany, IRepoQueryOne } from '../interfaces/repository-query.interface';
import { AbstractBase } from './base.abstract';
import { AbstractEntity } from './entity.abstract';
import { AbstractRepository } from './repository.abstract';

export interface IServiceOptions<T> {
  model?: T;
  performedBy?: User;
  skipPublish?: boolean;
  skipRequest?: boolean;
  skipCacheInvalidate?: boolean;
}
export abstract class AbstractService<T extends AbstractEntity, R extends AbstractRepository<T>>
  extends AbstractBase
  implements OnModuleInit
{
  constructor(
    private readonly _serviceContext: ServiceContext,
    private readonly _repository: R,
  ) {
    super(_serviceContext.core);
  }

  public onModuleInit() {
    this.initializeDependencies();
  }

  public async getOne(args?: IRepoQueryOne<T>): Promise<T | null> {
    try {
      const result = await this.repository.getOne(args);
      if (!result) throw new CustomNotFoundError('Không tìm thấy đối tượng');

      return result;
    } catch (error) {
      this.logger.error(error, `${this.className}:getOne`);
    }
    return null;
  }

  public async getMany(args?: IRepoQueryMany<T>): Promise<T[]> {
    try {
      const result = await this.repository.getMany(args);

      return result;
    } catch (error) {
      this.logger.error(error, `${this.className}:getMany`);
    }
    return [];
  }

  public async getPagination(args?: IRepoQueryMany<T>): Promise<IPaginationResponse<T>> {
    try {
      const { count, data } = await this.repository.getPagination(args);

      return { metadata: this.metadata.response(count, args?.pagination), data };
    } catch (error) {
      this.logger.error(error, `${this.className}:getPagination`);
    }
    return { metadata: this.metadata.response(0, args?.pagination), data: [] };
  }

  public async getByIds(ids: number[]): Promise<T[]> {
    try {
      const uniqueIds = [...new Set(ids)];
      const results = await this.repository.getByIds(uniqueIds);

      return results;
    } catch (error) {
      this.logger.error(error, `${this.className}:getByIds`);
    }
    return [];
  }

  public async create(data: DeepPartial<T>, options: IServiceOptions<T> = {}): Promise<T | null> {
    try {
      const result = await this.repository.create({
        ...data,
        ...this.metadata.create(options.performedBy),
      });

      if (!options.skipPublish) {
        this.rabbitMQ.publish(ACTIONS.created, result);
      }
      if (!options.skipCacheInvalidate) {
        const entityName = this.util.getEntity(this.className);
        this.redis.invalidateByPattern(`${entityName}:*`);
      }

      return result;
    } catch (error) {
      this.logger.error(error, `${this.className}:create`);
      throw error;
    }
  }

  public async bulkCreate(
    data: DeepPartial<T>[],
    options: Omit<IServiceOptions<T>, 'model'> = {},
  ): Promise<T[]> {
    try {
      const results = await this.repository.bulkCreate(
        data.map((elm) => ({ ...elm, ...this.metadata.create(options.performedBy) })),
      );

      for (const result of results) {
        if (!options.skipPublish) {
          this.rabbitMQ.publish(ACTIONS.created, result);
        }
      }

      return results;
    } catch (error) {
      this.logger.error(error, `${this.className}:bulkCreate`);
      throw error;
    }
  }

  public async update(
    id: number,
    data: DeepPartial<T>,
    options: IServiceOptions<T> = {},
  ): Promise<T | null> {
    try {
      if (!options.model) {
        options.model = await this.repository.getOne({
          where: { id } as unknown as FindOptionsWhere<T>,
        });
      }
      if (!options.model || options.model['id'] !== id)
        throw new CustomNotFoundError('Không tìm thấy đối tượng');

      Object.assign(options.model, data, { ...this.metadata.update(options.performedBy) });

      const result = await this.repository.update(options.model);

      if (!options.skipPublish) {
        this.rabbitMQ.publish(ACTIONS.updated, result);
      }
      if (!options.skipCacheInvalidate) {
        const entityName = this.util.getEntity(this.className);
        this.redis.invalidateByPattern(`${entityName}:*`);
        this.redis.invalidate(`${entityName}:${result.id}`);
      }

      return result;
    } catch (error) {
      this.logger.error(error, `${this.className}:update`);
      throw error;
    }
  }

  public async bulkUpdate(
    data: DeepPartial<T>[],
    options: Omit<IServiceOptions<T>, 'model'> = {},
  ): Promise<T[]> {
    try {
      const results = await this.repository.bulkUpdate(
        data.map((elm) => ({ ...elm, ...this.metadata.update(options.performedBy) })),
      );

      for (const result of results) {
        if (!options.skipPublish) {
          this.rabbitMQ.publish(ACTIONS.updated, result);
        }
      }

      return results;
    } catch (error) {
      this.logger.error(error, `${this.className}:bulkUpdate`);
      throw error;
    }
  }

  public async delete(id: number, options: IServiceOptions<T> = {}): Promise<T | null> {
    try {
      if (!options.model) {
        options.model = await this.repository.getOne({
          where: { id } as unknown as FindOptionsWhere<T>,
        });
      }
      if (!options.model || options.model['id'] !== id)
        throw new CustomNotFoundError('Không tìm thấy đối tượng');

      Object.assign(options.model, { ...this.metadata.delete(options.performedBy) });

      const result = await this.repository.update(options.model);

      if (!options.skipPublish) {
        this.rabbitMQ.publish(ACTIONS.deleted, result);
      }
      if (!options.skipCacheInvalidate) {
        const entityName = this.util.getEntity(this.className);
        this.redis.invalidateByPattern(`${entityName}:*`);
        this.redis.invalidate(`${entityName}:${result.id}`);
      }

      return result;
    } catch (error) {
      this.logger.error(error, `${this.className}:delete`);
      throw error;
    }
  }

  public async bulkDelete(
    data: DeepPartial<T>[],
    options: Omit<IServiceOptions<T>, 'model'> = {},
  ): Promise<T[]> {
    try {
      const results = await this.repository.bulkUpdate(
        data.map((elm) => ({ ...elm, ...this.metadata.delete(options.performedBy) })),
      );

      for (const result of results) {
        if (!options.skipPublish) {
          this.rabbitMQ.publish(ACTIONS.deleted, result);
        }
      }

      return results;
    } catch (error) {
      this.logger.error(error, `${this.className}:bulkDelete`);
      throw error;
    }
  }

  public async restore(id: number, options: IServiceOptions<T> = {}): Promise<T | null> {
    try {
      if (!options.model) {
        options.model = await this.getOne({
          where: { id } as unknown as FindOptionsWhere<T>,
          withDeleted: true,
        });
      }
      if (!options.model || options.model['id'] !== id)
        throw new CustomNotFoundError('Không tìm thấy đối tượng');

      Object.assign(options.model, { ...this.metadata.restore() });

      return await this.repository.update(options.model);
    } catch (error) {
      this.logger.error(error, `${this.className}:restore`);
      throw error;
    }
  }

  public async bulkRestore(
    data: DeepPartial<T>[],
    _: Omit<IServiceOptions<T>, 'model'> = {},
  ): Promise<T[]> {
    try {
      return await this.repository.bulkUpdate(
        data.map((elm) => ({ ...elm, ...this.metadata.restore() })),
      );
    } catch (error) {
      this.logger.error(error, `${this.className}:bulkRestore`);
      throw error;
    }
  }

  public async hardDelete(id: number, options: IServiceOptions<T> = {}): Promise<T | null> {
    try {
      if (!options.model) {
        options.model = await this.repository.getOne({
          where: { id } as unknown as FindOptionsWhere<T>,
        });
      }
      if (!options.model || options.model['id'] !== id)
        throw new CustomNotFoundError('Không tìm thấy đối tượng');

      return await this.repository.hardDelete(options.model);
    } catch (error) {
      this.logger.error(error, `${this.className}:hardDelete`);
      throw error;
    }
  }

  public async bulkHardDelete(data: T[]): Promise<T[]> {
    try {
      return await this.repository.bulkHardDelete(data);
    } catch (error) {
      this.logger.error(error, `${this.className}:bulkHardDelete`);
      throw error;
    }
  }

  // Protected methods

  protected abstract initializeDependencies(): void;

  protected get moduleRef(): ModuleRef {
    return this._serviceContext.moduleRef;
  }

  protected get rabbitMQ() {
    return {
      publish: this.publishRabbitMQEvent.bind(this),
      request: this.requestRabbitMQRPC.bind(this),
    };
  }

  protected get redis() {
    return {
      get: this.getRedis.bind(this),
      set: this.setRedis.bind(this),
      invalidate: this.invalidateRedis.bind(this),
      invalidateByPattern: this.invalidateRedisByPattern.bind(this),
    };
  }

  protected get metadata() {
    return {
      response: this.responseMetadata.bind(this),
      create: this.createMetadata.bind(this),
      update: this.updateMetadata.bind(this),
      delete: this.deleteMetadata.bind(this),
      restore: this.restoreMetadata.bind(this),
    };
  }

  protected async executeInTransaction<T>(callback: () => Promise<T>): Promise<T> {
    try {
      return await this.repository.executeInTransaction<T>(callback);
    } catch (error) {
      this.logger.error(error, `${this.className}:executeInTransaction`);
      throw error;
    }
  }

  protected build(data: DeepPartial<T>): DeepPartial<T> {
    try {
      return this.repository.build(data);
    } catch (error) {
      this.logger.error(error, `${this.className}:build`);
      throw error;
    }
  }

  // Private methods

  private get repository(): R {
    return this._repository;
  }

  private get rabbitMQService(): RabbitMQService {
    return this._serviceContext.rabbitMQService;
  }

  private get redisService(): RedisService {
    return this._serviceContext.redisService;
  }

  private responseMetadata(
    totalItem: number,
    {
      page = this.config.getNumber('DEFAULT_PAGE'),
      limit = this.config.getNumber('DEFAULT_PAGE_SIZE'),
      pagination_type,
    }: IPagination,
  ): MetadataResponse {
    if (pagination_type === EPaginationType.ALL) {
      page = 1;
      limit = totalItem;
    }

    return {
      current_page: page,
      page_size: limit,
      total_items: totalItem || 0,
      total_pages: totalItem && limit ? Math.ceil(totalItem / limit) : 1,
    };
  }

  private createMetadata(createdBy?: { id: number }) {
    return {
      created_at: new Date(),
      created_by: createdBy?.id,
      updated_at: new Date(),
      updated_by: createdBy?.id,
    };
  }

  private updateMetadata(updatedBy?: { id: number }) {
    return { updated_at: new Date(), updated_by: updatedBy?.id };
  }

  private deleteMetadata(deletedBy?: { id: number }) {
    return { deleted_at: new Date(), deleted_by: deletedBy?.id };
  }

  private restoreMetadata() {
    return { deleted_at: null, deleted_by: null };
  }

  private async publishRabbitMQEvent(
    action: string,
    data: unknown,
    type: 'direct' | 'topic' | 'fanout' = 'direct',
  ): Promise<boolean> {
    try {
      const entity = this.util.getEntity(this.className);
      const routingKey = RABBITMQ_EVENTS.publish[entity]?.[action];

      return await this.rabbitMQService.publish(entity, routingKey, data, type);
    } catch (error) {
      this.logger.error(error, `${this.className}:publishRabbitMQEvent`);
    }

    return false;
  }

  private async requestRabbitMQRPC<T>(
    action: string,
    data: unknown,
    type: 'direct' | 'topic' | 'fanout' = 'direct',
  ): Promise<T | null> {
    try {
      const entity = this.util.getEntity(this.className);
      const routingKey = RABBITMQ_EVENTS.request[entity]?.[action];

      const result = await this.rabbitMQService.request<IRabbitMQResponse<T>>(
        entity,
        routingKey,
        data,
        type,
      );
      if (!result.success) throw new Error(result.message || 'Lỗi khi gửi sự kiện');

      return result.data;
    } catch (error) {
      this.logger.error(error, `${this.className}:requestRabbitMQRPC`);
    }

    return null;
  }

  private async getRedis<T>(key: string): Promise<T | null> {
    try {
      const result = await this.redisService.get<T>(key);
      if (!result) return null;

      return result;
    } catch (error) {
      this.logger.error(error, `${this.className}:getRedis`);
    }
    return null;
  }

  private async setRedis<T>(key: string, value: T, ttl?: number): Promise<boolean> {
    try {
      const result = await this.redisService.set(key, value, ttl);
      if (!result) return false;

      return true;
    } catch (error) {
      this.logger.error(error, `${this.className}:setRedis`);
    }
    return false;
  }

  private async invalidateRedis(key: string): Promise<boolean> {
    try {
      const result = await this.redisService.del(key);
      if (!result) return false;

      return true;
    } catch (error) {
      this.logger.error(error, `${this.className}:invalidateRedis`);
    }
    return false;
  }

  private async invalidateRedisByPattern(pattern: string): Promise<boolean> {
    try {
      const result = await this.redisService.delByPattern(pattern);
      if (!result) return false;

      return true;
    } catch (error) {
      this.logger.error(error, `${this.className}:invalidateRedisByPattern`);
    }
    return false;
  }
}

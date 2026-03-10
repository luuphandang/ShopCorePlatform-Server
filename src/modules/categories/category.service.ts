import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ModuleRef } from '@nestjs/core';

import { AbstractService, IServiceOptions } from '@/common/abstracts/service.abstract';
import { EnvironmentVariables } from '@/common/helpers/env.validation';
import { AppLogger } from '@/common/logger/logger.service';
import { RabbitMQService } from '@/common/rabbitmq/rabbitmq.service';
import { UtilService } from '@/common/utils/util.service';

import { CategoryRepository } from './category.repository';
import { Category } from './entities/category.entity';
import { CreateCategoryInput } from './inputs/create-category.input';
import { UpdateCategoryInput } from './inputs/update-category.input';
import { RedisService } from '@/common/redis/redis.service';

@Injectable()
export class CategoryService extends AbstractService<Category, CategoryRepository> {
  constructor(
    configService: ConfigService<EnvironmentVariables>,
    utilService: UtilService,
    appLogger: AppLogger,
    rabbitMQService: RabbitMQService,
    redisService: RedisService,
    moduleRef: ModuleRef,

    private readonly categoryRepository: CategoryRepository,
  ) {
    super(configService, utilService, appLogger, rabbitMQService, redisService, moduleRef, categoryRepository);
  }

  protected initializeDependencies() {}

  public async createCategory(
    data: CreateCategoryInput,
    options: IServiceOptions<Category> = {},
  ): Promise<Category> {
    try {
      return await this.executeInTransaction(async () => {
        const parent = data.parent_id ? await this.getOne({ where: { id: data.parent_id } }) : null;

        const childrens = Array.isArray(data.children_ids)
          ? await this.getMany({ where: { id: { $in: data.children_ids } } })
          : [];

        return await this.create(
          { ...data, parent_id: parent?.id, children_ids: childrens.map((child) => child.id) },
          options,
        );
      });
    } catch (error) {
      this.logger.error(error, `${this.className}:createCategory`);
      throw error;
    }
  }

  public async updateCategory(
    id: number,
    data: UpdateCategoryInput,
    options: IServiceOptions<Category> = {},
  ): Promise<Category> {
    try {
      return await this.executeInTransaction(async () => {
        const parent = data.parent_id ? await this.getOne({ where: { id: data.parent_id } }) : null;

        const childrens = Array.isArray(data.children_ids)
          ? await this.getMany({ where: { id: { $in: data.children_ids } } })
          : [];

        return await this.update(
          id,
          {
            ...data,
            parent_id: parent?.id,
            children_ids: childrens.map((child) => child.id),
          },
          options,
        );
      });
    } catch (error) {
      this.logger.error(error, `${this.className}:updateCategory`);
      throw error;
    }
  }
}

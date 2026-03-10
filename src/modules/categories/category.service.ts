import { Injectable } from '@nestjs/common';

import { AbstractService, IServiceOptions } from '@/common/abstracts/service.abstract';
import { ServiceContext } from '@/common/contexts';

import { CategoryRepository } from './category.repository';
import { Category } from './entities/category.entity';
import { CreateCategoryInput } from './inputs/create-category.input';
import { UpdateCategoryInput } from './inputs/update-category.input';

@Injectable()
export class CategoryService extends AbstractService<Category, CategoryRepository> {
  constructor(
    serviceContext: ServiceContext,
    private readonly categoryRepository: CategoryRepository,
  ) {
    super(serviceContext, categoryRepository);
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

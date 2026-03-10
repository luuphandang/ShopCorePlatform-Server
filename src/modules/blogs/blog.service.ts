import { Injectable } from '@nestjs/common';

import { AbstractService, IServiceOptions } from '@/common/abstracts/service.abstract';
import { CustomNotFoundError } from '@/common/exceptions/not-found.exception';
import { ServiceContext } from '@/common/contexts';

import { CategoryService } from '../categories/category.service';
import { BlogRepository } from './blog.repository';
import { Blog } from './entities/blog.entity';
import { CreateBlogInput } from './inputs/create-blog.input';
import { UpdateBlogInput } from './inputs/update-blog.input';

@Injectable()
export class BlogService extends AbstractService<Blog, BlogRepository> {
  private categoryService: CategoryService;

  constructor(
    serviceContext: ServiceContext,
    private readonly blogRepository: BlogRepository,
  ) {
    super(serviceContext, blogRepository);
  }

  protected initializeDependencies() {
    this.categoryService = this.moduleRef.get(CategoryService, { strict: false });
  }

  public async createBlog(
    data: CreateBlogInput,
    options: IServiceOptions<Blog> = {},
  ): Promise<Blog> {
    try {
      return await this.executeInTransaction(async () => {
        return await this.create(
          {
            ...data,
            ...(Array.isArray(data?.categories) &&
              data.categories.map((category) => category.id).filter(Boolean)),
          },
          options,
        );
      });
    } catch (error) {
      this.logger.error(error, `${this.className}:createBlog`);
      throw error;
    }
  }

  public async updateBlog(
    id: number,
    data: UpdateBlogInput,
    options: IServiceOptions<Blog> = {},
  ): Promise<Blog | null> {
    try {
      return await this.executeInTransaction(async () => {
        if (!options.model) {
          options.model = await this.getOne({
            where: { id },
            relations: {
              categories: true,
            },
          });
        }
        if (!options.model || options.model.id !== id)
          throw new CustomNotFoundError('Không tìm thấy dữ liệu.');

        Object.assign(options.model, {
          ...data,
          ...(Array.isArray(data?.categories) &&
            data.categories.map((category) => category.id).filter(Boolean)),
        });

        return this.update(id, options.model, options);
      });
    } catch (error) {
      this.logger.error(error, `${this.className}:updateBlog`);
      throw error;
    }
  }
}

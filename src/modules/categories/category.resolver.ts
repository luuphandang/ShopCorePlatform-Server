import { UseInterceptors } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  Args,
  Context,
  Int,
  Mutation,
  Parent,
  Query,
  ResolveField,
  Resolver,
} from '@nestjs/graphql';

import { AbstractResolver } from '@/common/abstracts/resolver.abstract';
import { UseAuthGuard } from '@/common/decorators/auth-guard.decorator';
import { CurrentUser } from '@/common/decorators/user.decorator';
import { GetManyInput, GetOneInput } from '@/common/graphql/query.input';
import { EnvironmentVariables } from '@/common/helpers/env.validation';
import { QueryManyInterceptor } from '@/common/interceptors/query-many.interceptor';
import { QueryOneInterceptor } from '@/common/interceptors/query-one.interceptor';
import { AppLogger } from '@/common/logger/logger.service';
import { PERMISSIONS } from '@/common/constants/permission.constant';
import { UtilService } from '@/common/utils/util.service';

import { FileUpload } from '../file-uploads/entities/file-upload.entity';
import { User } from '../users/entities/user.entity';
import { CategoryService } from './category.service';
import { Category, GetCategoryType } from './entities/category.entity';
import { CreateCategoryInput } from './inputs/create-category.input';
import { UpdateCategoryInput } from './inputs/update-category.input';

@Resolver(() => Category)
export class CategoryResolver extends AbstractResolver<CategoryService> {
  constructor(
    configService: ConfigService<EnvironmentVariables>,
    utilService: UtilService,
    appLogger: AppLogger,

    private readonly categoryService: CategoryService,
  ) {
    super(configService, utilService, appLogger, categoryService);
  }

  @Query(() => Category, { nullable: true })
  @UseInterceptors(QueryOneInterceptor)
  async category(
    @Args({ name: 'query', nullable: true }) condition: GetOneInput<Category>,
  ): Promise<Category> {
    const category = await this.categoryService.getOne(condition);

    return category;
  }

  @Query(() => GetCategoryType)
  @UseInterceptors(QueryManyInterceptor)
  async categories(
    @Args({ name: 'query', nullable: true }) condition: GetManyInput<Category>,
  ): Promise<GetCategoryType> {
    const categories = await this.categoryService.getPagination(condition);

    return categories;
  }

  @Mutation(() => Category)
  @UseAuthGuard([PERMISSIONS.CREATE_CATEGORY])
  async createCategory(
    @Args('data') data: CreateCategoryInput,
    @CurrentUser() user: User,
  ): Promise<Category> {
    return await this.categoryService.createCategory(data, { performedBy: user });
  }

  @Mutation(() => Category)
  @UseAuthGuard([PERMISSIONS.UPDATE_CATEGORY])
  async updateCategory(
    @Args('id', { type: () => Int }) id: number,
    @Args('data') data: UpdateCategoryInput,
    @CurrentUser() user: User,
  ): Promise<Category> {
    return await this.categoryService.update(id, data, { performedBy: user });
  }

  @Mutation(() => Category, { nullable: true })
  @UseAuthGuard([PERMISSIONS.DELETE_CATEGORY])
  async deleteCategory(
    @Args('id', { type: () => Int }) id: number,
    @CurrentUser() user: User,
  ): Promise<Category | null> {
    return await this.categoryService.delete(id, { performedBy: user });
  }

  @ResolveField(() => [Category], { nullable: true })
  async children(
    @Parent() category: Category,
    @Context() { loaders }: IGraphQLContext,
  ): Promise<Category[]> {
    if (!Array.isArray(category?.children_ids) || category.children_ids.length === 0) return [];

    const children = await loaders.categories.load(category.children_ids);
    return category.children_ids
      .map((id) => children.get(id))
      .filter((child): child is Category => child !== undefined);
  }

  @ResolveField(() => FileUpload, { nullable: true })
  async thumbnail(
    @Parent() category: Category,
    @Context() { loaders }: IGraphQLContext,
  ): Promise<FileUpload> {
    if (!category.thumbnail_id) return null;

    const imagesMap = await loaders.fileUploads.load([category.thumbnail_id]);
    return imagesMap.get(category.thumbnail_id);
  }

  @ResolveField(() => User, { nullable: true })
  async creator(
    @Parent() category: Category,
    @Context() { loaders }: IGraphQLContext,
  ): Promise<User> {
    if (!category.created_by) return null;

    const usersMap = await loaders.users.load([category.created_by]);
    return usersMap.get(category.created_by);
  }

  @ResolveField(() => User, { nullable: true })
  async updater(
    @Parent() category: Category,
    @Context() { loaders }: IGraphQLContext,
  ): Promise<User> {
    if (!category.updated_by) return null;

    const usersMap = await loaders.users.load([category.updated_by]);
    return usersMap.get(category.updated_by);
  }
}

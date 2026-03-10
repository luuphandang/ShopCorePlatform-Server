import { UseInterceptors } from '@nestjs/common';
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
import { CoreContext } from '@/common/contexts';
import { UseAuthGuard } from '@/common/decorators/auth-guard.decorator';
import { CurrentUser } from '@/common/decorators/user.decorator';
import { GetManyInput, GetOneInput } from '@/common/graphql/query.input';
import { QueryManyInterceptor } from '@/common/interceptors/query-many.interceptor';
import { QueryOneInterceptor } from '@/common/interceptors/query-one.interceptor';
import { PERMISSIONS } from '@/common/constants/permission.constant';

import { Category } from '../categories/entities/category.entity';
import { User } from '../users/entities/user.entity';
import { BlogService } from './blog.service';
import { Blog, GetBlogType } from './entities/blog.entity';
import { CreateBlogInput } from './inputs/create-blog.input';
import { UpdateBlogInput } from './inputs/update-blog.input';

@Resolver(() => Blog)
export class BlogResolver extends AbstractResolver<BlogService> {
  constructor(
    coreContext: CoreContext,
    private readonly blogService: BlogService,
  ) {
    super(coreContext, blogService);
  }

  @Query(() => Blog, { nullable: true })
  @UseInterceptors(QueryOneInterceptor)
  async blog(@Args({ name: 'query', nullable: true }) condition: GetOneInput<Blog>): Promise<Blog> {
    const blog = await this.blogService.getOne(condition);

    return blog;
  }

  @Query(() => GetBlogType)
  @UseInterceptors(QueryManyInterceptor)
  async blogs(
    @Args({ name: 'query', nullable: true }) query: GetManyInput<Blog>,
  ): Promise<GetBlogType> {
    const blogs = await this.blogService.getPagination(query);

    return blogs;
  }

  @Mutation(() => Blog)
  async createBlog(@Args('data') data: CreateBlogInput, @CurrentUser() user: User): Promise<Blog> {
    return await this.blogService.createBlog(data, { performedBy: user });
  }

  @Mutation(() => Blog)
  @UseAuthGuard([PERMISSIONS.UPDATE_BLOG])
  async updateBlog(
    @Args('id', { type: () => Int }) id: number,
    @Args('data') data: UpdateBlogInput,
    @CurrentUser() user: User,
  ): Promise<Blog> {
    return await this.blogService.updateBlog(id, data, { performedBy: user });
  }

  @Mutation(() => Blog, { nullable: true })
  @UseAuthGuard([PERMISSIONS.DELETE_BLOG])
  async deleteBlog(
    @Args('id', { type: () => Int }) id: number,
    @CurrentUser() user: User,
  ): Promise<Blog | null> {
    return await this.blogService.delete(id, { performedBy: user });
  }

  @ResolveField(() => [Category], { nullable: true })
  async categories(
    @Parent() blog: Blog,
    @Context() { loaders }: IGraphQLContext,
  ): Promise<Category[]> {
    if (!Array.isArray(blog.category_ids) || !blog.category_ids.length) return [];

    const categoriesMap = await loaders.categories.load(blog.category_ids);
    return blog.category_ids
      .map((id) => categoriesMap.get(id))
      .filter((category): category is Category => category !== undefined);
  }

  @ResolveField(() => User, { nullable: true })
  async creator(@Parent() blog: Blog, @Context() { loaders }: IGraphQLContext): Promise<User> {
    if (!blog.created_by) return null;

    const usersMap = await loaders.users.load([blog.created_by]);
    return usersMap.get(blog.created_by);
  }

  @ResolveField(() => User, { nullable: true })
  async updater(@Parent() blog: Blog, @Context() { loaders }: IGraphQLContext): Promise<User> {
    if (!blog.updated_by) return null;

    const usersMap = await loaders.users.load([blog.updated_by]);
    return usersMap.get(blog.updated_by);
  }
}

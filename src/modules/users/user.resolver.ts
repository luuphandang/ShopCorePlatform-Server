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

import { FileUpload } from '../file-uploads/entities/file-upload.entity';
import { Role } from '../roles/entities/role.entity';
import { GetUserType, User } from './entities/user.entity';
import { CreateUserInput } from './inputs/create-user.input';
import { UpdateUserInput } from './inputs/update-user.input';
import { UserService } from './user.service';

@Resolver(() => User)
export class UserResolver extends AbstractResolver<UserService> {
  constructor(
    coreContext: CoreContext,
    private readonly userService: UserService,
  ) {
    super(coreContext, userService);
  }

  @Query(() => User, { nullable: true })
  @UseAuthGuard([PERMISSIONS.MY_USER])
  @UseInterceptors(QueryOneInterceptor)
  async myUser(
    @Args({ name: 'query', nullable: true }) condition: GetOneInput<User>,
  ): Promise<User> {
    const user = await this.userService.getOne(condition);

    return user;
  }

  @Query(() => User, { nullable: true })
  @UseAuthGuard([PERMISSIONS.VIEW_USER])
  @UseInterceptors(QueryOneInterceptor)
  async user(@Args({ name: 'query', nullable: true }) condition: GetOneInput<User>): Promise<User> {
    const user = await this.userService.getOne(condition);

    return user;
  }

  @Query(() => GetUserType)
  @UseAuthGuard([PERMISSIONS.VIEW_USER])
  @UseInterceptors(QueryManyInterceptor)
  async users(
    @Args({ name: 'query', nullable: true }) query: GetManyInput<User>,
  ): Promise<GetUserType> {
    const users = await this.userService.getPagination(query);

    return users;
  }

  @Mutation(() => User)
  @UseAuthGuard([PERMISSIONS.CREATE_USER])
  async createUser(@Args('data') data: CreateUserInput, @CurrentUser() user: User): Promise<User> {
    return await this.userService.createUser(data, { performedBy: user });
  }

  @Mutation(() => User)
  @UseAuthGuard([PERMISSIONS.UPDATE_USER])
  async updateUser(
    @Args('id', { type: () => Int }) id: number,
    @Args('data') data: UpdateUserInput,
    @CurrentUser() user: User,
  ): Promise<User> {
    return await this.userService.updateUser(id, data, { performedBy: user });
  }

  @Mutation(() => User, { nullable: true })
  @UseAuthGuard([PERMISSIONS.DELETE_USER])
  async deleteUser(
    @Args('id', { type: () => Int }) id: number,
    @CurrentUser() user: User,
  ): Promise<User | null> {
    return await this.userService.delete(id, { performedBy: user });
  }

  @ResolveField(() => FileUpload, { nullable: true })
  async avatar(@Parent() user: User, @Context() { loaders }: IGraphQLContext): Promise<FileUpload> {
    if (!user.avatar_id) return null;

    const filesMap = await loaders.fileUploads.load([user.avatar_id]);
    return filesMap.get(user.avatar_id);
  }

  @ResolveField(() => [Role], { nullable: true })
  async roles(@Parent() user: User, @Context() { loaders }: IGraphQLContext): Promise<Role[]> {
    if (!Array.isArray(user.role_ids) || !user.role_ids.length) return [];

    const rolesMap = await loaders.roles.load(user.role_ids);
    return user.role_ids
      .map((id) => rolesMap.get(id))
      .filter((role): role is Role => role !== undefined);
  }

  @ResolveField(() => User, { nullable: true })
  async creator(@Parent() user: User, @Context() { loaders }: IGraphQLContext): Promise<User> {
    if (!user.created_by) return null;

    const usersMap = await loaders.users.load([user.created_by]);
    return usersMap.get(user.created_by);
  }

  @ResolveField(() => User, { nullable: true })
  async updater(@Parent() user: User, @Context() { loaders }: IGraphQLContext): Promise<User> {
    if (!user.updated_by) return null;

    const usersMap = await loaders.users.load([user.updated_by]);
    return usersMap.get(user.updated_by);
  }
}

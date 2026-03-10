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

import { Permission } from '../permissions/entities/permission.entity';
import { User } from '../users/entities/user.entity';
import { GetRoleType, Role } from './entities/role.entity';
import { CreateRoleInput } from './inputs/create-role.input';
import { UpdateRoleInput } from './inputs/update-role.input';
import { RoleService } from './role.service';

@Resolver(() => Role)
export class RoleResolver extends AbstractResolver<RoleService> {
  constructor(
    coreContext: CoreContext,
    private readonly roleService: RoleService,
  ) {
    super(coreContext, roleService);
  }

  @Query(() => Role, { nullable: true })
  @UseAuthGuard([PERMISSIONS.VIEW_ROLE])
  @UseInterceptors(QueryOneInterceptor)
  async role(@Args({ name: 'query', nullable: true }) condition: GetOneInput<Role>): Promise<Role> {
    const role = await this.roleService.getOne(condition);

    return role;
  }

  @Query(() => GetRoleType)
  @UseAuthGuard([PERMISSIONS.VIEW_ROLE])
  @UseInterceptors(QueryManyInterceptor)
  async roles(
    @Args({ name: 'query', nullable: true }) query: GetManyInput<Role>,
  ): Promise<GetRoleType> {
    return await this.roleService.getPagination(query);
  }

  @Mutation(() => Role)
  @UseAuthGuard([PERMISSIONS.CREATE_ROLE])
  async createRole(@Args('data') data: CreateRoleInput, @CurrentUser() user: User): Promise<Role> {
    return await this.roleService.createRole(data, { performedBy: user });
  }

  @Mutation(() => Role)
  @UseAuthGuard([PERMISSIONS.UPDATE_ROLE])
  async updateRole(
    @Args('id', { type: () => Int }) id: number,
    @Args('data') data: UpdateRoleInput,
    @CurrentUser() user: User,
  ): Promise<Role> {
    return await this.roleService.updateRole(id, data, { performedBy: user });
  }

  @Mutation(() => Role, { nullable: true })
  @UseAuthGuard([PERMISSIONS.DELETE_ROLE])
  async deleteRole(
    @Args('id', { type: () => Int }) id: number,
    @CurrentUser() user: User,
  ): Promise<Role | null> {
    return await this.roleService.delete(id, { performedBy: user });
  }

  @ResolveField(() => [Permission], { nullable: true })
  async permissions(
    @Parent() role: Role,
    @Context() { loaders }: IGraphQLContext,
  ): Promise<Permission[]> {
    if (!Array.isArray(role.permission_ids) || !role.permission_ids.length) return [];

    const permissionsMap = await loaders.permissions.load(role.permission_ids);
    return role.permission_ids
      .map((id) => permissionsMap.get(id))
      .filter((permission): permission is Permission => permission !== undefined);
  }

  @ResolveField(() => User, { nullable: true })
  async creator(@Parent() user: User, @Context() { loaders }: IGraphQLContext): Promise<User> {
    if (!user.created_by) return null;

    const users = await loaders.users.load([user.created_by]);
    return users[0];
  }

  @ResolveField(() => User, { nullable: true })
  async updater(@Parent() user: User, @Context() { loaders }: IGraphQLContext): Promise<User> {
    if (!user.updated_by) return null;

    const users = await loaders.users.load([user.updated_by]);
    return users[0];
  }
}

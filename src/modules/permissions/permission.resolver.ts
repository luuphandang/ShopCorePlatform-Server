import { UseInterceptors } from '@nestjs/common';
import { Args, Query, Resolver } from '@nestjs/graphql';

import { AbstractResolver } from '@/common/abstracts/resolver.abstract';
import { CoreContext } from '@/common/contexts';
import { UseAuthGuard } from '@/common/decorators/auth-guard.decorator';
import { GetManyInput, GetOneInput } from '@/common/graphql/query.input';
import { QueryManyInterceptor } from '@/common/interceptors/query-many.interceptor';
import { QueryOneInterceptor } from '@/common/interceptors/query-one.interceptor';
import { PERMISSIONS } from '@/common/constants/permission.constant';

import { GetPermissionType, Permission } from './entities/permission.entity';
import { PermissionService } from './permission.service';

@Resolver(() => Permission)
export class PermissionResolver extends AbstractResolver<PermissionService> {
  constructor(
    coreContext: CoreContext,
    private readonly permissionService: PermissionService,
  ) {
    super(coreContext, permissionService);
  }

  @Query(() => GetPermissionType)
  @UseAuthGuard([PERMISSIONS.MY_PERMISSION])
  @UseInterceptors(QueryManyInterceptor)
  async myPermissions(
    @Args({ name: 'query', nullable: true })
    query: GetManyInput<Permission>,
  ): Promise<GetPermissionType> {
    return await this.permissionService.getPagination(query);
  }

  @Query(() => Permission, { nullable: true })
  @UseAuthGuard([PERMISSIONS.VIEW_PERMISSION])
  @UseInterceptors(QueryOneInterceptor)
  async permission(
    @Args({ name: 'query', nullable: true }) condition: GetOneInput<Permission>,
  ): Promise<Permission> {
    return await this.permissionService.getOne(condition);
  }

  @Query(() => GetPermissionType)
  @UseAuthGuard([PERMISSIONS.VIEW_PERMISSION])
  @UseInterceptors(QueryManyInterceptor)
  async permissions(
    @Args({ name: 'query', nullable: true })
    query: GetManyInput<Permission>,
  ): Promise<GetPermissionType> {
    return await this.permissionService.getPagination(query);
  }

  // @Mutation(() => Permission)
  // @UseAuthGuard([PERMISSIONS.FULL_ACCESS])
  // async createPermission(
  //   @Args('data') data: CreatePermissionInput,
  //   @CurrentUser() user: User,
  // ): Promise<Permission> {
  //   return await this.permissionService.create(data, { performedBy: user });
  // }

  // @Mutation(() => Permission)
  // @UseAuthGuard([PERMISSIONS.FULL_ACCESS])
  // async updatePermission(
  //   @Args('id', { type: () => Int }) id: number,
  //   @Args('data') data: UpdatePermissionInput,
  //   @CurrentUser() user: User,
  // ): Promise<Permission> {
  //   return await this.permissionService.update(id, data, { performedBy: user });
  // }

  // @Mutation(() => Permission, { nullable: true })
  // @UseAuthGuard([PERMISSIONS.FULL_ACCESS])
  // async deletePermission(
  //   @Args('id', { type: () => Int }) id: number,
  //   @CurrentUser() user: User,
  // ): Promise<Permission | null> {
  //   return await this.permissionService.delete(id, { performedBy: user });
  // }
}

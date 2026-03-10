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

import { User } from '../users/entities/user.entity';
import { GetUnitType, Unit } from './entities/unit.entity';
import { CreateUnitInput } from './inputs/create-unit.input';
import { UpdateUnitInput } from './inputs/update-unit.input';
import { UnitService } from './unit.service';

@Resolver(() => Unit)
export class UnitResolver extends AbstractResolver<UnitService> {
  constructor(
    coreContext: CoreContext,
    private readonly unitService: UnitService,
  ) {
    super(coreContext, unitService);
  }

  @Query(() => Unit, { nullable: true })
  @UseInterceptors(QueryOneInterceptor)
  async unit(@Args({ name: 'query', nullable: true }) condition: GetOneInput<Unit>): Promise<Unit> {
    const unit = await this.unitService.getOne(condition);

    return unit;
  }

  @Query(() => GetUnitType)
  @UseInterceptors(QueryManyInterceptor)
  async units(
    @Args({ name: 'query', nullable: true }) query: GetManyInput<Unit>,
  ): Promise<GetUnitType> {
    const units = await this.unitService.getPagination(query);

    return units;
  }

  @Mutation(() => Unit)
  @UseAuthGuard([PERMISSIONS.CREATE_UNIT])
  async createUnit(@Args('data') data: CreateUnitInput, @CurrentUser() user: User): Promise<Unit> {
    return await this.unitService.create(data, { performedBy: user });
  }

  @Mutation(() => Unit)
  @UseAuthGuard([PERMISSIONS.UPDATE_UNIT])
  async updateUnit(
    @Args('id', { type: () => Int }) id: number,
    @Args('data') data: UpdateUnitInput,
    @CurrentUser() user: User,
  ): Promise<Unit> {
    return await this.unitService.update(id, data, { performedBy: user });
  }

  @Mutation(() => Unit, { nullable: true })
  @UseAuthGuard([PERMISSIONS.DELETE_UNIT])
  async deleteUnit(
    @Args('id', { type: () => Int }) id: number,
    @CurrentUser() user: User,
  ): Promise<Unit | null> {
    return await this.unitService.delete(id, { performedBy: user });
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

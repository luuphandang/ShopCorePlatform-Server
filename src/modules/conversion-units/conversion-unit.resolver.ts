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

import { Unit } from '../units/entities/unit.entity';
import { User } from '../users/entities/user.entity';
import { ConversionUnitService } from './conversion-unit.service';
import { ConversionUnit, GetConversionUnitType } from './entities/conversion-unit.entity';
import { CreateConversionUnitInput } from './inputs/create-conversion-unit.input';
import { UpdateConversionUnitInput } from './inputs/update-conversion-unit.input';

@Resolver(() => ConversionUnit)
export class ConversionUnitResolver extends AbstractResolver<ConversionUnitService> {
  constructor(
    configService: ConfigService<EnvironmentVariables>,
    utilService: UtilService,
    appLogger: AppLogger,

    private readonly conversionUnitService: ConversionUnitService,
  ) {
    super(configService, utilService, appLogger, conversionUnitService);
  }

  @Query(() => ConversionUnit, { nullable: true })
  @UseInterceptors(QueryOneInterceptor)
  async conversionUnit(
    @Args({ name: 'query', nullable: true }) condition: GetOneInput<ConversionUnit>,
  ): Promise<ConversionUnit> {
    const conversionUnit = await this.conversionUnitService.getOne(condition);

    return conversionUnit;
  }

  @Query(() => GetConversionUnitType)
  @UseInterceptors(QueryManyInterceptor)
  async conversionUnits(
    @Args({ name: 'query', nullable: true }) query: GetManyInput<ConversionUnit>,
  ): Promise<GetConversionUnitType> {
    const conversionUnits = await this.conversionUnitService.getPagination(query);

    return conversionUnits;
  }

  @Mutation(() => ConversionUnit)
  @UseAuthGuard([PERMISSIONS.CREATE_CONVERSION_UNIT])
  async createConversionUnit(
    @Args('data') data: CreateConversionUnitInput,
    @CurrentUser() user: User,
  ): Promise<ConversionUnit> {
    return await this.conversionUnitService.create(data, { performedBy: user });
  }

  @Mutation(() => ConversionUnit)
  @UseAuthGuard([PERMISSIONS.UPDATE_CONVERSION_UNIT])
  async updateConversionUnit(
    @Args('id', { type: () => Int }) id: number,
    @Args('data') data: UpdateConversionUnitInput,
    @CurrentUser() user: User,
  ): Promise<ConversionUnit> {
    return await this.conversionUnitService.update(id, data, { performedBy: user });
  }

  @Mutation(() => ConversionUnit, { nullable: true })
  @UseAuthGuard([PERMISSIONS.DELETE_CONVERSION_UNIT])
  async deleteConversionUnit(
    @Args('id', { type: () => Int }) id: number,
    @CurrentUser() user: User,
  ): Promise<ConversionUnit | null> {
    return await this.conversionUnitService.delete(id, { performedBy: user });
  }

  @ResolveField(() => Unit, { nullable: true })
  async unit(
    @Parent() conversionUnit: ConversionUnit,
    @Context() { loaders }: IGraphQLContext,
  ): Promise<Unit> {
    if (!conversionUnit.unit_id) return null;

    const unitsMap = await loaders.units.load([conversionUnit.unit_id]);
    return unitsMap.get(conversionUnit.unit_id);
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

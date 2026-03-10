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

import { User } from '../users/entities/user.entity';
import { AddressService } from './address.service';
import { Address, GetAddressType } from './entities/address.entity';
import { CreateAddressInput } from './inputs/create-address.input';
import { UpdateAddressInput } from './inputs/update-address.input';

@Resolver(() => Address)
export class AddressResolver extends AbstractResolver<AddressService> {
  constructor(
    configService: ConfigService<EnvironmentVariables>,
    utilService: UtilService,
    appLogger: AppLogger,

    private readonly addressService: AddressService,
  ) {
    super(configService, utilService, appLogger, addressService);
  }

  @Query(() => Address, { nullable: true })
  @UseAuthGuard([PERMISSIONS.MY_ADDRESS])
  @UseInterceptors(QueryOneInterceptor)
  async myAddress(
    @Args({ name: 'query', nullable: true })
    condition: GetOneInput<Address>,
  ): Promise<Address> {
    return await this.addressService.getOne(condition);
  }

  @Query(() => GetAddressType)
  @UseAuthGuard([PERMISSIONS.MY_ADDRESS])
  @UseInterceptors(QueryManyInterceptor)
  async myAddresses(
    @Args({ name: 'query', nullable: true })
    query: GetManyInput<Address>,
  ): Promise<GetAddressType> {
    return await this.addressService.getPagination(query);
  }

  @Query(() => Address, { nullable: true })
  @UseAuthGuard([PERMISSIONS.VIEW_ADDRESS])
  @UseInterceptors(QueryOneInterceptor)
  async address(
    @Args({ name: 'query', nullable: true })
    condition: GetOneInput<Address>,
  ): Promise<Address> {
    return await this.addressService.getOne(condition);
  }

  @Query(() => GetAddressType)
  @UseAuthGuard([PERMISSIONS.VIEW_ADDRESS])
  @UseInterceptors(QueryManyInterceptor)
  async addresses(
    @Args({ name: 'query', nullable: true })
    query: GetManyInput<Address>,
  ): Promise<GetAddressType> {
    return await this.addressService.getPagination(query);
  }

  @Mutation(() => Address)
  @UseAuthGuard([PERMISSIONS.CREATE_ADDRESS])
  async createAddress(
    @Args('data') data: CreateAddressInput,
    @CurrentUser() user: User,
  ): Promise<Address> {
    return await this.addressService.create(data, { performedBy: user });
  }

  @Mutation(() => Address)
  @UseAuthGuard([PERMISSIONS.UPDATE_ADDRESS])
  async updateAddress(
    @Args('id', { type: () => Int }) id: number,
    @Args('data') data: UpdateAddressInput,
    @CurrentUser() user: User,
  ): Promise<Address> {
    return await this.addressService.update(id, data, { performedBy: user });
  }

  @Mutation(() => Address, { nullable: true })
  @UseAuthGuard([PERMISSIONS.DELETE_ADDRESS])
  async deleteAppointment(
    @Args('id', { type: () => Int }) id: number,
    @CurrentUser() user: User,
  ): Promise<Address | null> {
    return await this.addressService.delete(id, { performedBy: user });
  }

  // Resolve fields

  @ResolveField(() => User, { nullable: true })
  async creator(
    @Parent() address: Address,
    @Context() { loaders }: IGraphQLContext,
  ): Promise<User> {
    if (!address.created_by) return null;

    const usersMap = await loaders.users.load([address.created_by]);
    return usersMap.get(address.created_by);
  }

  @ResolveField(() => User, { nullable: true })
  async updater(
    @Parent() address: Address,
    @Context() { loaders }: IGraphQLContext,
  ): Promise<User> {
    if (!address.updated_by) return null;

    const usersMap = await loaders.users.load([address.updated_by]);
    return usersMap.get(address.updated_by);
  }
}

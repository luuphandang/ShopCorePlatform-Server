import { UseInterceptors } from '@nestjs/common';
import { Args, Context, Parent, Query, ResolveField, Resolver } from '@nestjs/graphql';

import { AbstractResolver } from '@/common/abstracts/resolver.abstract';
import { CoreContext } from '@/common/contexts';
import { GetManyInput, GetOneInput } from '@/common/graphql/query.input';
import { QueryManyInterceptor } from '@/common/interceptors/query-many.interceptor';
import { QueryOneInterceptor } from '@/common/interceptors/query-one.interceptor';

import { User } from '../users/entities/user.entity';
import { GetOrderShippingType, OrderShipping } from './entities/order-shipping.entity';
import { OrderShippingService } from './order-shipping.service';

@Resolver(() => OrderShipping)
export class OrderShippingResolver extends AbstractResolver<OrderShippingService> {
  constructor(
    coreContext: CoreContext,
    private readonly orderShippingService: OrderShippingService,
  ) {
    super(coreContext, orderShippingService);
  }

  @Query(() => OrderShipping, { nullable: true })
  @UseInterceptors(QueryOneInterceptor)
  async shipping(
    @Args({ name: 'query', nullable: true }) condition: GetOneInput<OrderShipping>,
  ): Promise<OrderShipping> {
    const shipping = await this.orderShippingService.getOne(condition);

    return shipping;
  }

  @Query(() => GetOrderShippingType)
  @UseInterceptors(QueryManyInterceptor)
  async shippings(
    @Args({ name: 'query', nullable: true }) query: GetManyInput<OrderShipping>,
  ): Promise<GetOrderShippingType> {
    const shippings = await this.orderShippingService.getPagination(query);

    return shippings;
  }

  // Resolve fields

  @ResolveField(() => User, { nullable: true })
  async creator(
    @Parent() orderShipping: OrderShipping,
    @Context() { loaders }: IGraphQLContext,
  ): Promise<User> {
    if (!orderShipping.created_by) return null;

    const usersMap = await loaders.users.load([orderShipping.created_by]);
    return usersMap.get(orderShipping.created_by);
  }

  @ResolveField(() => User, { nullable: true })
  async updater(
    @Parent() orderShipping: OrderShipping,
    @Context() { loaders }: IGraphQLContext,
  ): Promise<User> {
    if (!orderShipping.updated_by) return null;

    const usersMap = await loaders.users.load([orderShipping.updated_by]);
    return usersMap.get(orderShipping.updated_by);
  }
}

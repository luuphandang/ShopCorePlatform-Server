import { Context, Parent, ResolveField, Resolver } from '@nestjs/graphql';

import { AbstractResolver } from '@/common/abstracts/resolver.abstract';
import { CoreContext } from '@/common/contexts';

import { User } from '../users/entities/user.entity';
import { OrderHistory } from './entities/order-history.entity';
import { OrderHistoryService } from './order-history.service';
@Resolver(() => OrderHistory)
export class OrderHistoryResolver extends AbstractResolver<OrderHistoryService> {
  constructor(
    coreContext: CoreContext,
    private readonly orderHistoryService: OrderHistoryService,
  ) {
    super(coreContext, orderHistoryService);
  }

  // Resolve fields

  @ResolveField(() => User, { nullable: true })
  async creator(
    @Parent() orderHistory: OrderHistory,
    @Context() { loaders }: IGraphQLContext,
  ): Promise<User> {
    if (!orderHistory.created_by) return null;

    const usersMap = await loaders.users.load([orderHistory.created_by]);
    return usersMap.get(orderHistory.created_by);
  }

  @ResolveField(() => User, { nullable: true })
  async updater(
    @Parent() orderHistory: OrderHistory,
    @Context() { loaders }: IGraphQLContext,
  ): Promise<User> {
    if (!orderHistory.updated_by) return null;

    const usersMap = await loaders.users.load([orderHistory.updated_by]);
    return usersMap.get(orderHistory.updated_by);
  }
}

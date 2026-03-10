import { UseInterceptors } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Args, Context, Mutation, Parent, Query, ResolveField, Resolver } from '@nestjs/graphql';

import { AbstractResolver } from '@/common/abstracts/resolver.abstract';
import { CurrentUser } from '@/common/decorators/user.decorator';
import { GetOneInput } from '@/common/graphql/query.input';
import { EnvironmentVariables } from '@/common/helpers/env.validation';
import { QueryOneInterceptor } from '@/common/interceptors/query-one.interceptor';
import { AppLogger } from '@/common/logger/logger.service';
import { UtilService } from '@/common/utils/util.service';

import { OrderDetail } from '../order-details/entities/order-detail.entity';
import { OrderHistory } from '../order-histories/entities/order-history.entity';
import { Order } from '../orders/entities/order.entity';
import { CreateOrderInput } from '../orders/inputs/create-order.input';
import { UpdateOrderInput } from '../orders/inputs/update-order.input';
import { User } from '../users/entities/user.entity';
import { CartService } from './cart.service';
import { AddToCartInput, CheckoutCartInput, RemoveFromCartInput } from './inputs/handle-cart.input';

@Resolver(() => Order)
export class CartResolver extends AbstractResolver<CartService> {
  constructor(
    configService: ConfigService<EnvironmentVariables>,
    utilService: UtilService,
    appLogger: AppLogger,

    private readonly cartService: CartService,
  ) {
    super(configService, utilService, appLogger, cartService);
  }

  // Cart

  @Query(() => Order, { nullable: true })
  @UseInterceptors(QueryOneInterceptor)
  async myCart(
    @Args({ name: 'query', nullable: true })
    condition: GetOneInput<{ customer_id: number; code: string }>,
  ): Promise<Order> {
    const { where } = condition;

    return await this.cartService.getCart({
      customerId: where?.customer_id as number,
      code: where?.code as string,
    });
  }

  @Mutation(() => Order)
  async createCart(
    @Args('data') data: CreateOrderInput,
    @CurrentUser() user: User,
  ): Promise<Order> {
    return await this.cartService.createCart(data, { performedBy: user });
  }

  @Mutation(() => Order)
  async updateCart(
    @Args('code') code: string,
    @Args('data') data: UpdateOrderInput,
    @CurrentUser() user: User,
  ): Promise<Order> {
    return await this.cartService.updateCart(code, data, { performedBy: user });
  }

  @Mutation(() => Order)
  async addToCart(
    @Args('code') code: string,
    @Args('data') data: AddToCartInput,
    @CurrentUser() user: User,
  ): Promise<Order> {
    return await this.cartService.addToCart(code, data, { performedBy: user });
  }

  @Mutation(() => Order)
  async removeFromCart(
    @Args('code') code: string,
    @Args('data') data: RemoveFromCartInput,
    @CurrentUser() user: User,
  ): Promise<Order> {
    return await this.cartService.removeFromCart(code, data, { performedBy: user });
  }

  @Mutation(() => Order)
  async clearCart(@Args('code') code: string, @CurrentUser() user: User): Promise<Order> {
    return await this.cartService.clearCart(code, { performedBy: user });
  }

  @Mutation(() => Order)
  async checkoutCart(
    @Args('code') code: string,
    @Args('data') data: CheckoutCartInput,
    @CurrentUser() user: User,
  ): Promise<Order> {
    return await this.cartService.checkoutCart(code, data, { performedBy: user });
  }

  // Resolve Field

  @ResolveField(() => [OrderDetail], { nullable: true })
  async order_details(
    @Parent() order: Order,
    @Context() { loaders }: IGraphQLContext,
  ): Promise<OrderDetail[]> {
    if (!order.id) return [];

    const orderDetailsMap = await loaders.orderRelated.details.load([order.id]);
    const result = orderDetailsMap.get(order.id);

    if (Array.isArray(result)) result.sort((a, b) => (a.created_at < b.created_at ? 1 : -1));

    return result;
  }

  @ResolveField(() => [OrderHistory], { nullable: true })
  async histories(
    @Parent() order: Order,
    @Context() { loaders }: IGraphQLContext,
  ): Promise<OrderHistory[]> {
    if (!order.id) return [];

    const orderHistoriesMap = await loaders.orderRelated.histories.load([order.id]);
    return orderHistoriesMap.get(order.id);
  }

  @ResolveField(() => User, { nullable: true })
  async customer(@Parent() order: Order, @Context() { loaders }: IGraphQLContext): Promise<User> {
    if (!order.customer_id) return null;

    const usersMap = await loaders.users.load([order.customer_id]);
    return usersMap.get(order.customer_id);
  }

  @ResolveField(() => User, { nullable: true })
  async creator(@Parent() order: Order, @Context() { loaders }: IGraphQLContext): Promise<User> {
    if (!order.created_by) return null;

    const usersMap = await loaders.users.load([order.created_by]);
    return usersMap.get(order.created_by);
  }

  @ResolveField(() => User, { nullable: true })
  async updater(@Parent() order: Order, @Context() { loaders }: IGraphQLContext): Promise<User> {
    if (!order.updated_by) return null;

    const usersMap = await loaders.users.load([order.updated_by]);
    return usersMap.get(order.updated_by);
  }
}

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

import { OrderDetail } from '../order-details/entities/order-detail.entity';
import { OrderHistory } from '../order-histories/entities/order-history.entity';
import { GetOrderType, Order } from '../orders/entities/order.entity';
import { User } from '../users/entities/user.entity';
import { CreateOrderInput } from './inputs/create-order.input';
import { UpdateOrderInput } from './inputs/update-order.input';
import { OrderService } from './order.service';

@Resolver(() => Order)
export class OrderResolver extends AbstractResolver<OrderService> {
  constructor(
    configService: ConfigService<EnvironmentVariables>,
    utilService: UtilService,
    appLogger: AppLogger,

    private readonly orderService: OrderService,
  ) {
    super(configService, utilService, appLogger, orderService);
  }

  @Query(() => Order, { nullable: true })
  @UseInterceptors(QueryOneInterceptor)
  async trackingOrder(
    @Args({ name: 'query', nullable: true })
    condition: GetOneInput<{ code: string }>,
  ): Promise<Order> {
    const { where } = condition;

    return await this.orderService.getOne({
      where: {
        code: where.code as string,
      },
    });
  }

  @Query(() => Order, { nullable: true })
  @UseAuthGuard([PERMISSIONS.MY_ORDER])
  @UseInterceptors(QueryOneInterceptor)
  async myOrder(
    @Args({ name: 'query', nullable: true })
    condition: GetOneInput<Order>,
    @CurrentUser() user: User,
  ): Promise<Order> {
    if (condition?.where) condition.where['customer_id'] = user.id;

    return await this.orderService.getOne(condition);
  }

  @Query(() => GetOrderType)
  @UseAuthGuard([PERMISSIONS.MY_ORDER])
  @UseInterceptors(QueryManyInterceptor)
  async myOrders(
    @Args({ name: 'query', nullable: true })
    query: GetManyInput<Order>,
    @CurrentUser() user: User,
  ): Promise<GetOrderType> {
    if (query?.where) query.where['customer_id'] = user.id;

    return await this.orderService.getPagination(query);
  }

  @Query(() => Order, { nullable: true })
  @UseAuthGuard([PERMISSIONS.VIEW_ORDER])
  @UseInterceptors(QueryOneInterceptor)
  async order(
    @Args({ name: 'query', nullable: true })
    condition: GetOneInput<Order>,
  ): Promise<Order> {
    return await this.orderService.getOne(condition);
  }

  @Query(() => GetOrderType)
  @UseAuthGuard([PERMISSIONS.VIEW_ORDER])
  @UseInterceptors(QueryManyInterceptor)
  async orders(
    @Args({ name: 'query', nullable: true })
    query: GetManyInput<Order>,
  ): Promise<GetOrderType> {
    return await this.orderService.getPagination(query);
  }

  @Mutation(() => Order)
  @UseAuthGuard([PERMISSIONS.CREATE_ORDER])
  async createOrder(
    @Args('data') data: CreateOrderInput,
    @CurrentUser() user: User,
  ): Promise<Order> {
    return await this.orderService.createOrder(data, { performedBy: user });
  }

  @Mutation(() => Order)
  @UseAuthGuard([PERMISSIONS.UPDATE_ORDER])
  async updateOrder(
    @Args('id', { type: () => Int }) id: number,
    @Args('data') data: UpdateOrderInput,
    @CurrentUser() user: User,
  ): Promise<Order> {
    const permissions = user.roles.flatMap((role) =>
      role.permissions.map((permission) => permission.value),
    );
    if (!permissions.includes(PERMISSIONS.SET_ORDER_STATUS)) {
      delete data.status;
    }
    return await this.orderService.updateOrder(id, data, { performedBy: user });
  }

  @Mutation(() => Order, { nullable: true })
  @UseAuthGuard([PERMISSIONS.DELETE_ORDER])
  async deleteOrder(
    @Args('id', { type: () => Int }) id: number,
    @CurrentUser() user: User,
  ): Promise<Order | null> {
    return await this.orderService.delete(id, { performedBy: user });
  }

  @Mutation(() => Order, { nullable: true })
  @UseAuthGuard([PERMISSIONS.SET_ORDER_STATUS])
  async confirmedOrder(
    @Args('id', { type: () => Int }) id: number,
    @CurrentUser() user: User,
  ): Promise<Order | null> {
    return await this.orderService.confirmedOrder(id, { performedBy: user });
  }

  @Mutation(() => Order, { nullable: true })
  @UseAuthGuard([PERMISSIONS.SET_ORDER_STATUS])
  async processingOrder(
    @Args('id', { type: () => Int }) id: number,
    @CurrentUser() user: User,
  ): Promise<Order | null> {
    return await this.orderService.processingOrder(id, { performedBy: user });
  }

  @Mutation(() => Order, { nullable: true })
  @UseAuthGuard([PERMISSIONS.SET_ORDER_STATUS])
  async shippedOrder(
    @Args('id', { type: () => Int }) id: number,
    @CurrentUser() user: User,
  ): Promise<Order | null> {
    return await this.orderService.shippedOrder(id, { performedBy: user });
  }

  @Mutation(() => Order, { nullable: true })
  @UseAuthGuard([PERMISSIONS.SET_ORDER_STATUS])
  async inTransitOrder(
    @Args('id', { type: () => Int }) id: number,
    @CurrentUser() user: User,
  ): Promise<Order | null> {
    return await this.orderService.inTransitOrder(id, { performedBy: user });
  }

  @Mutation(() => Order, { nullable: true })
  @UseAuthGuard([PERMISSIONS.SET_ORDER_STATUS])
  async returnedOrder(
    @Args('id', { type: () => Int }) id: number,
    @CurrentUser() user: User,
  ): Promise<Order | null> {
    return await this.orderService.returnedOrder(id, { performedBy: user });
  }

  @Mutation(() => Order, { nullable: true })
  @UseAuthGuard([PERMISSIONS.SET_ORDER_STATUS])
  async completedOrder(
    @Args('id', { type: () => Int }) id: number,
    @CurrentUser() user: User,
  ): Promise<Order | null> {
    return await this.orderService.completedOrder(id, { performedBy: user });
  }

  @Mutation(() => Order, { nullable: true })
  @UseAuthGuard([PERMISSIONS.SET_ORDER_STATUS])
  async refundedOrder(
    @Args('id', { type: () => Int }) id: number,
    @CurrentUser() user: User,
  ): Promise<Order | null> {
    return await this.orderService.refundedOrder(id, { performedBy: user });
  }

  @Mutation(() => Order, { nullable: true })
  @UseAuthGuard([PERMISSIONS.SET_ORDER_STATUS])
  async cancelledOrder(
    @Args('id', { type: () => Int }) id: number,
    @CurrentUser() user: User,
  ): Promise<Order | null> {
    return await this.orderService.cancelledOrder(id, { performedBy: user });
  }

  // Resolve Field
  @ResolveField(() => [OrderDetail], { nullable: true })
  async order_details(
    @Parent() order: Order,
    @Context() { loaders }: IGraphQLContext,
  ): Promise<OrderDetail[]> {
    if (!order.id) return [];

    const orderDetailsMap = await loaders.orderRelated.details.load([order.id]);
    return orderDetailsMap.get(order.id);
  }

  @ResolveField(() => [OrderHistory], { nullable: true })
  async histories(
    @Parent() order: Order,
    @Context() { loaders }: IGraphQLContext,
  ): Promise<OrderHistory[]> {
    if (!order.id) return null;

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

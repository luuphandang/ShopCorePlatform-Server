import { Context, Parent, ResolveField, Resolver } from '@nestjs/graphql';

import { AbstractResolver } from '@/common/abstracts/resolver.abstract';
import { CoreContext } from '@/common/contexts';

import { ConversionUnit } from '../conversion-units/entities/conversion-unit.entity';
import { OrderShipping } from '../order-shippings/entities/order-shipping.entity';
import { ProductVariant } from '../product-variants/entities/product-variant.entity';
import { Product } from '../products/entities/product.entity';
import { User } from '../users/entities/user.entity';
import { OrderDetail } from './entities/order-detail.entity';
import { OrderDetailService } from './order-detail.service';

@Resolver(() => OrderDetail)
export class OrderDetailResolver extends AbstractResolver<OrderDetailService> {
  constructor(
    coreContext: CoreContext,
    private readonly orderDetailService: OrderDetailService,
  ) {
    super(coreContext, orderDetailService);
  }

  // Resolve fields

  @ResolveField(() => Product, { nullable: true })
  async product(
    @Parent() orderDetail: OrderDetail,
    @Context() { loaders }: IGraphQLContext,
  ): Promise<Product> {
    if (!orderDetail.product_id) return null;

    const productsMap = await loaders.products.load([orderDetail.product_id]);
    return productsMap.get(orderDetail.product_id);
  }

  @ResolveField(() => ProductVariant, { nullable: true })
  async variant(
    @Parent() orderDetail: OrderDetail,
    @Context() { loaders }: IGraphQLContext,
  ): Promise<ProductVariant> {
    if (!orderDetail.variant_id) return null;

    const variantsMap = await loaders.productVariants.load([orderDetail.variant_id]);
    return variantsMap.get(orderDetail.variant_id);
  }

  @ResolveField(() => ConversionUnit, { nullable: true })
  async conversion_unit(
    @Parent() orderDetail: OrderDetail,
    @Context() { loaders }: IGraphQLContext,
  ): Promise<ConversionUnit> {
    if (!orderDetail.conversion_unit_id) return null;

    const conversionUnitsMap = await loaders.conversionUnits.load([orderDetail.conversion_unit_id]);
    return conversionUnitsMap.get(orderDetail.conversion_unit_id);
  }

  @ResolveField(() => OrderShipping, { nullable: true })
  async shipping(
    @Parent() orderDetail: OrderDetail,
    @Context() { loaders }: IGraphQLContext,
  ): Promise<OrderShipping> {
    if (!orderDetail.order_id) return null;

    const orderShippingsMap = await loaders.orderDetailRelated.shippings.load([orderDetail.id]);
    const orderShipping = orderShippingsMap.get(orderDetail.id);
    return Array.isArray(orderShipping) ? orderShipping[0] : null;
  }

  @ResolveField(() => User, { nullable: true })
  async creator(
    @Parent() orderDetail: OrderDetail,
    @Context() { loaders }: IGraphQLContext,
  ): Promise<User> {
    if (!orderDetail.created_by) return null;

    const usersMap = await loaders.users.load([orderDetail.created_by]);
    return usersMap.get(orderDetail.created_by);
  }

  @ResolveField(() => User, { nullable: true })
  async updater(
    @Parent() orderDetail: OrderDetail,
    @Context() { loaders }: IGraphQLContext,
  ): Promise<User> {
    if (!orderDetail.updated_by) return null;

    const usersMap = await loaders.users.load([orderDetail.updated_by]);
    return usersMap.get(orderDetail.updated_by);
  }
}

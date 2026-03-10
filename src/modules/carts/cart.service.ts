import { Injectable } from '@nestjs/common';

import { IServiceOptions } from '@/common/abstracts/service.abstract';
import { CustomBadRequestError } from '@/common/exceptions/bad-request.exception';
import { CustomNotFoundError } from '@/common/exceptions/not-found.exception';
import { CustomUnknownError } from '@/common/exceptions/unknown.exception';
import { ServiceContext } from '@/common/contexts';
import { CODE_PREFIX } from '@/common/constants/code-prefix.constant';
import { EOrderStatus, EShippingStatus } from '@/common/enums/order.enum';

import { Order } from '../orders/entities/order.entity';
import { CreateOrderInput } from '../orders/inputs/create-order.input';
import { UpdateOrderInput } from '../orders/inputs/update-order.input';
import { IGetCartInput } from '../orders/interfaces/cart.interface';
import { OrderRepository } from '../orders/order.repository';
import { OrderService } from '../orders/order.service';
import { AddToCartInput, CheckoutCartInput, RemoveFromCartInput } from './inputs/handle-cart.input';

@Injectable()
export class CartService extends OrderService {
  constructor(
    serviceContext: ServiceContext,
    orderRepository: OrderRepository,
  ) {
    super(serviceContext, orderRepository);
  }

  // Cart methods

  async getCart({ customerId, code }: IGetCartInput): Promise<Order | null> {
    try {
      if (!customerId && !code) return null;

      const isLoggedIn = !!customerId;

      return await this.getOne({
        where: {
          ...(isLoggedIn && { customer_id: customerId }),
          ...(!isLoggedIn && { code }),
          status: EOrderStatus.CART,
        },
      });
    } catch (error) {
      this.logger.error(`[${this.className}:getCart]: ${error}`);
      throw error;
    }
  }

  async createCart(data: CreateOrderInput, options: IServiceOptions<Order> = {}): Promise<Order> {
    try {
      return await this.executeInTransaction(async () => {
        const cartExists = await this.getCart({
          ...(data.code && { code: data.code }),
          customerId: data.customer_id,
        });
        if (cartExists) return cartExists;
        if (!data.code) data.code = this.util.generateCode(CODE_PREFIX.Cart);

        return await this.createOrder(data, options);
      });
    } catch (error) {
      this.logger.error(`[${this.className}:createCart]: ${error}`);
      throw error;
    }
  }

  async updateCart(
    code: string,
    data: UpdateOrderInput,
    options: IServiceOptions<Order> = {},
  ): Promise<Order> {
    try {
      return await this.executeInTransaction(async () => {
        const cartExists = await this.getCart({ code });
        if (!cartExists) throw new CustomNotFoundError('Không tìm thấy giỏ hàng');

        return await this.updateOrder(cartExists.id, data, options);
      });
    } catch (error) {
      this.logger.error(`[${this.className}:createCart]: ${error}`);
      throw error;
    }
  }

  async addToCart(
    code: string,
    data: AddToCartInput,
    options: IServiceOptions<Order> = {},
  ): Promise<Order | null> {
    try {
      return await this.executeInTransaction(async () => {
        const { product_id, variant_id, conversion_unit_id, quantity, note } = data;
        const { performedBy } = options;

        const cart = await this.getCart({ code });
        if (!cart) return null;

        await this.createOrderDetail(
          {
            product_id,
            variant_id,
            conversion_unit_id,
            quantity,
            order_id: cart.id,
            note,
          },
          { performedBy, order: cart },
        );

        return await this.refreshOrder(cart.id, { performedBy });
      });
    } catch (error) {
      this.logger.error(`[${this.className}:addToCart]: ${error}`);
      throw error;
    }
  }

  async removeFromCart(
    code: string,
    data: RemoveFromCartInput,
    options: IServiceOptions<Order> = {},
  ): Promise<Order | null> {
    try {
      this.logger.debug(
        `Delete record with arg: ${JSON.stringify({ code, data, options })}`,
        `${this.className}:removeFromCart`,
      );

      return await this.executeInTransaction(async () => {
        const { product_id, variant_id, conversion_unit_id } = data;
        const { performedBy } = options;

        const cart = await this.getCart({ code: code });
        if (!cart) throw new Error('Không tìm thấy giỏ hàng');

        const orderDetail = await this.orderDetailService.getOne({
          where: {
            order_id: cart.id,
            product_id,
            variant_id,
            conversion_unit_id,
          },
        });
        if (!orderDetail) throw new Error('Không tìm thấy sản phẩm trong giỏ hàng');

        const orderDetailDeleted = await this.orderDetailService.hardDelete(orderDetail.id, {
          performedBy,
          model: orderDetail,
        });
        if (!orderDetailDeleted) throw new Error('Xoá sản phẩm trong giỏ hàng không thành công');

        return await this.refreshOrder(cart.id, { performedBy });
      });
    } catch (error) {
      this.logger.error(`[${this.className}:removeFromCart]: ${error}`);
      throw error;
    }
  }

  async clearCart(code: string, options: IServiceOptions<Order> = {}): Promise<Order | null> {
    try {
      this.logger.debug(
        `Clear cart with arg: ${JSON.stringify({ code, options })}`,
        `${this.className}:clearCart`,
      );
      return await this.executeInTransaction(async () => {
        const { performedBy } = options;

        const cart = await this.getCart({ code: code });
        if (!cart) throw new Error('Không tìm thấy giỏ hàng');

        const orderDetails = await this.orderDetailService.getMany({
          where: { order_id: cart.id },
        });

        const orderDetailsDeleted = await this.orderDetailService.bulkHardDelete(orderDetails);
        if (!orderDetailsDeleted) throw new Error('Xoá sản phẩm trong giỏ hàng không thành công');

        return await this.refreshOrder(cart.id, { performedBy });
      });
    } catch (error) {
      this.logger.error(`[${this.className}:clearCart]: ${error}`);
      throw error;
    }
  }

  async checkoutCart(
    code: string,
    data: CheckoutCartInput,
    options: IServiceOptions<Order> = {},
  ): Promise<Order | null> {
    try {
      this.logger.debug(
        `Checkout cart with arg: ${JSON.stringify({ code, data, options })}`,
        `${this.className}:checkoutCart`,
      );

      return await this.executeInTransaction(async () => {
        const { performedBy } = options;

        const cart = await this.getCart({ code: code });
        if (!cart) throw new CustomNotFoundError('Không tìm thấy giỏ hàng');

        const orderDetails = await this.orderDetailService.getMany({
          where: { order_id: cart.id },
        });
        if (!Array.isArray(orderDetails))
          throw new CustomBadRequestError('Không tìm thấy sản phẩm trong giỏ hàng');

        const orderShippings = await Promise.all(
          orderDetails.map(async (elm) => {
            return await this.createOrderShipping(
              { ...data, order_detail_id: elm.id, status: EShippingStatus.NOT_REQUIRED },
              { performedBy, orderDetail: elm },
            );
          }),
        );
        if (!Array.isArray(orderShippings))
          throw new CustomUnknownError('Đăng ký vận chuyển không thành công');

        // if (!data.address_id && cart.customer_id) {
        //   await this.createAddress(
        //     {
        //       name: data.to_name,
        //       phone: data.to_phone,
        //       email: data.to_email,
        //       address: data.to_address,
        //     },
        //     { performedBy },
        //   );
        // }

        // Assign order id to order details item if migration cart from database to cache (redis)
        await this.update(
          cart.id,
          {
            ...cart,
            code: this.util.generateCode(CODE_PREFIX.Order),
            status: EOrderStatus.PENDING,
            note: data.note,
          },
          { performedBy, model: cart },
        );

        await this.changeOrderStatus(cart.id, EOrderStatus.PENDING, { performedBy });

        return await this.refreshOrder(cart.id, { performedBy });
      });
    } catch (error) {
      this.logger.error(`[${this.className}:checkoutCart]: ${error}`);
      throw error;
    }
  }
}

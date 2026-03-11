import { Injectable, OnModuleInit } from '@nestjs/common';

import {
  AbstractStatusService,
  IStatusChangeOptions,
  IStatusTransitionMap,
} from '@/common/abstracts/status-service.abstract';
import { IServiceOptions } from '@/common/abstracts/service.abstract';
import { CustomNotFoundError } from '@/common/exceptions/not-found.exception';
import { CustomBadRequestError } from '@/common/exceptions/bad-request.exception';
import { ServiceContext } from '@/common/contexts';
import { EOrderStatus, EShippingStatus } from '@/common/enums/order.enum';

import { AddressService } from '../addresses/address.service';
import { Address } from '../addresses/entities/address.entity';
import { CreateAddressInput } from '../addresses/inputs/create-address.input';
import { OrderDetail } from '../order-details/entities/order-detail.entity';
import { CreateOrderDetailInput } from '../order-details/inputs/create-order-detail.input';
import {
  IOrderDetailServiceOptions,
  OrderDetailService,
} from '../order-details/order-detail.service';
import { OrderHistory } from '../order-histories/entities/order-history.entity';
import { CreateOrderHistoryInput } from '../order-histories/inputs/create-order-history.input';
import { OrderHistoryService } from '../order-histories/order-history.service';
import { OrderShipping } from '../order-shippings/entities/order-shipping.entity';
import { CreateOrderShippingInput } from '../order-shippings/inputs/create-order-shipping.input';
import { OrderShippingService } from '../order-shippings/order-shipping.service';
import { Order } from './entities/order.entity';
import { CreateOrderInput } from './inputs/create-order.input';
import { UpdateOrderInput } from './inputs/update-order.input';
import { OrderRepository } from './order.repository';

const ORDER_TRANSITIONS: IStatusTransitionMap<EOrderStatus> = {
  [EOrderStatus.CART]: [EOrderStatus.PENDING],
  [EOrderStatus.PENDING]: [EOrderStatus.CONFIRMED, EOrderStatus.CANCELLED],
  [EOrderStatus.CONFIRMED]: [EOrderStatus.PROCESSING, EOrderStatus.CANCELLED],
  [EOrderStatus.PROCESSING]: [EOrderStatus.SHIPPED, EOrderStatus.ON_HOLD, EOrderStatus.CANCELLED],
  [EOrderStatus.ON_HOLD]: [EOrderStatus.PROCESSING, EOrderStatus.CANCELLED],
  [EOrderStatus.SHIPPED]: [EOrderStatus.COMPLETED],
  [EOrderStatus.COMPLETED]: [EOrderStatus.REFUNDED],
};

const SHIPPING_TRANSITIONS: IStatusTransitionMap<EShippingStatus> = {
  [EShippingStatus.NOT_REQUIRED]: [EShippingStatus.PENDING],
  [EShippingStatus.PENDING]: [EShippingStatus.CONFIRMED],
  [EShippingStatus.CONFIRMED]: [EShippingStatus.SHIPPED],
  [EShippingStatus.SHIPPED]: [EShippingStatus.IN_TRANSIT, EShippingStatus.RETURNED],
  [EShippingStatus.IN_TRANSIT]: [EShippingStatus.DELIVERED, EShippingStatus.RETURNED, EShippingStatus.LOST],
  [EShippingStatus.DELIVERED]: [EShippingStatus.RETURNED],
};

@Injectable()
export class OrderService
  extends AbstractStatusService<Order, OrderRepository, EOrderStatus>
  implements OnModuleInit
{
  protected readonly statusTransitions = ORDER_TRANSITIONS;

  protected orderDetailService: OrderDetailService;
  protected orderShippingService: OrderShippingService;
  protected orderHistoryService: OrderHistoryService;
  protected addressService: AddressService;

  constructor(
    serviceContext: ServiceContext,
    private readonly orderRepository: OrderRepository,
  ) {
    super(serviceContext, orderRepository);
  }

  protected initializeDependencies() {
    this.orderDetailService = this.moduleRef.get(OrderDetailService, { strict: false });
    this.orderShippingService = this.moduleRef.get(OrderShippingService, { strict: false });
    this.orderHistoryService = this.moduleRef.get(OrderHistoryService, { strict: false });
    this.addressService = this.moduleRef.get(AddressService, { strict: false });
  }

  async createOrder(data: CreateOrderInput, options: IServiceOptions<Order> = {}): Promise<Order> {
    try {
      const { performedBy } = options;

      const order = await this.create(data, options);

      const orderDetails = await Promise.all(
        Array.isArray(data.order_details)
          ? data.order_details.map((elm: CreateOrderDetailInput) =>
              this.orderDetailService.createOrderDetail(elm, { performedBy, order }),
            )
          : [],
      );
      order.order_details = orderDetails.filter(Boolean);
      await this.summaryOrder(order);

      return await this.create(order, options);
    } catch (error) {
      this.logger.error(`[${this.className}:createOrder]: ${error}`);
      throw error;
    }
  }

  async updateOrder(
    id: number,
    data: UpdateOrderInput,
    options: IServiceOptions<Order> = {},
  ): Promise<Order | null> {
    try {
      if (!options?.model) {
        options.model = await this.getOne({
          where: { id },
          relations: { order_details: true },
        });
      }
      if (!options.model || options.model.id !== id)
        throw new CustomNotFoundError('Không tìm thấy dữ liệu.');

      Object.assign(options.model, data);
      await this.summaryOrder(options.model);

      return await this.update(id, options.model, options);
    } catch (error) {
      this.logger.error(error, `${this.className}:updateOrder`);
      throw error;
    }
  }

  async peddingOrder(id: number, options: IStatusChangeOptions<Order> = {}): Promise<Order | null> {
    return await this.changeStatus(id, EOrderStatus.PENDING, options);
  }

  async confirmedOrder(
    id: number,
    options: IStatusChangeOptions<Order> = {},
  ): Promise<Order | null> {
    return await this.changeStatus(id, EOrderStatus.CONFIRMED, options);
  }

  async processingOrder(
    id: number,
    options: IStatusChangeOptions<Order> = {},
  ): Promise<Order | null> {
    return await this.changeStatus(id, EOrderStatus.PROCESSING, options);
  }

  async shippedOrder(
    id: number,
    options: IStatusChangeOptions<Order> = {},
  ): Promise<Order | null> {
    await this.changeStatus(id, EOrderStatus.SHIPPED, options);
    return await this.changeShippingStatus(id, EShippingStatus.SHIPPED, options);
  }

  async inTransitOrder(
    id: number,
    options: IStatusChangeOptions<Order> = {},
  ): Promise<Order | null> {
    return await this.changeShippingStatus(id, EShippingStatus.IN_TRANSIT, options);
  }

  async deliveredOrder(
    id: number,
    options: IStatusChangeOptions<Order> = {},
  ): Promise<Order | null> {
    return await this.changeShippingStatus(id, EShippingStatus.DELIVERED, options);
  }

  async returnedOrder(
    id: number,
    options: IStatusChangeOptions<Order> = {},
  ): Promise<Order | null> {
    return await this.changeShippingStatus(id, EShippingStatus.RETURNED, options);
  }

  async completedOrder(
    id: number,
    options: IStatusChangeOptions<Order> = {},
  ): Promise<Order | null> {
    return await this.changeStatus(id, EOrderStatus.COMPLETED, options);
  }

  async refundedOrder(
    id: number,
    options: IStatusChangeOptions<Order> = {},
  ): Promise<Order | null> {
    return await this.changeStatus(id, EOrderStatus.REFUNDED, options);
  }

  async cancelledOrder(
    id: number,
    options: IStatusChangeOptions<Order> = {},
  ): Promise<Order | null> {
    return await this.changeStatus(id, EOrderStatus.CANCELLED, options);
  }

  // Hooks

  protected async afterStatusChange(
    model: Order,
    _currentStatus: EOrderStatus,
    newStatus: EOrderStatus,
    options: IStatusChangeOptions<Order>,
  ): Promise<void> {
    if (newStatus !== EOrderStatus.SHIPPED) {
      await this.createOrderHistory(
        { order_id: model.id, status: newStatus },
        { performedBy: options.performedBy },
      );
    }
  }

  // Private methods

  protected async changeShippingStatus(
    id: number,
    newStatus: EShippingStatus,
    options: IServiceOptions<Order> = {},
  ): Promise<Order | null> {
    try {
      if (!options.model) {
        options.model = await this.getOne({ where: { id } as any });
      }

      const currentShippingStatus = options.model.shipping_status as EShippingStatus;
      this.validateShippingTransition(currentShippingStatus, newStatus);

      const result = await this.update(id, { shipping_status: newStatus } as any, options);
      if (!result) throw new Error('Cập nhật trạng thái vận chuyển đơn hàng không thành công.');

      await this.createOrderHistory(
        { order_id: id, shipping_status: newStatus },
        { performedBy: options.performedBy },
      );

      return result;
    } catch (error) {
      this.logger.error(error, `${this.className}:changeShippingStatus`);
      throw error;
    }
  }

  protected validateShippingTransition(
    currentStatus: EShippingStatus,
    newStatus: EShippingStatus,
  ): void {
    const allowed = SHIPPING_TRANSITIONS[currentStatus];
    if (!allowed || !allowed.includes(newStatus)) {
      throw new CustomBadRequestError(
        `Không thể chuyển trạng thái vận chuyển từ "${currentStatus}" sang "${newStatus}".`,
      );
    }
  }

  protected async summaryOrder(order: Order) {
    const orderDetails =
      order.order_details ||
      (await this.orderDetailService.getMany({
        where: {
          order_id: order.id,
        },
      }));

    if (Array.isArray(orderDetails)) {
      order.total_cost = orderDetails.reduce((acc, curr) => acc + curr.total_cost, 0);
      order.final_cost = orderDetails.reduce((acc, curr) => acc + curr.final_cost, 0);
    }
  }

  protected async refreshOrder(
    id: number,
    options: IServiceOptions<Order> = {},
  ): Promise<Order | null> {
    try {
      return await this.updateOrder(id, {}, { performedBy: options.performedBy });
    } catch (error) {
      this.logger.error(`[${this.className}:refreshOrder]: ${error}`);
      throw error;
    }
  }

  protected async createOrderDetail(
    data: CreateOrderDetailInput,
    options: IOrderDetailServiceOptions,
  ) {
    try {
      return await this.orderDetailService.createOrderDetail(data, options);
    } catch (error) {
      this.logger.error(`[${this.className}:createOrderDetail]: ${error}`);
      throw error;
    }
  }

  protected async deleteOrderDetail(
    orderDetail: OrderDetail,
    options: IServiceOptions<OrderDetail>,
  ) {
    try {
      return await this.orderDetailService.delete(orderDetail.id, {
        performedBy: options.performedBy,
        model: orderDetail,
      });
    } catch (error) {
      this.logger.error(`[${this.className}:deleteOrderDetail]: ${error}`);
      throw error;
    }
  }

  protected async clearOrderDetails(
    orderDetails: OrderDetail[],
    options: IServiceOptions<OrderDetail>,
  ) {
    try {
      return await this.orderDetailService.bulkDelete(orderDetails, {
        performedBy: options.performedBy,
      });
    } catch (error) {
      this.logger.error(`[${this.className}:deleteOrderDetails]: ${error}`);
      throw error;
    }
  }

  protected async createOrderShipping(
    data: CreateOrderShippingInput,
    options: IServiceOptions<OrderShipping> & { orderDetail: OrderDetail },
  ) {
    try {
      const result = await this.orderShippingService.create(data, options);
      await this.orderDetailService.update(
        options.orderDetail.id,
        { shipping_status: result.status },
        { performedBy: options.performedBy },
      );

      return result;
    } catch (error) {
      this.logger.error(`[${this.className}:createOrderShipping]: ${error}`);
      throw error;
    }
  }

  protected async createOrderHistory(
    data: CreateOrderHistoryInput,
    options: IServiceOptions<OrderHistory>,
  ) {
    try {
      return await this.orderHistoryService.create(data, options);
    } catch (error) {
      this.logger.error(`[${this.className}:createOrderHistory]: ${error}`);
      throw error;
    }
  }

  protected async createAddress(data: CreateAddressInput, options: IServiceOptions<Address>) {
    try {
      return await this.addressService.create(data, options);
    } catch (error) {
      this.logger.error(`[${this.className}:createAddress]: ${error}`);
      throw error;
    }
  }
}

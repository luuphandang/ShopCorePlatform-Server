import { Injectable } from '@nestjs/common';
import { DeepPartial } from 'typeorm';

import { AbstractService, IServiceOptions } from '@/common/abstracts/service.abstract';
import { CustomNotFoundError } from '@/common/exceptions/not-found.exception';
import { ServiceContext } from '@/common/contexts';
import { EOrderStatus, EPaymentStatus, EShippingStatus } from '@/common/enums/order.enum';

import { ConversionUnitService } from '../conversion-units/conversion-unit.service';
import { ConversionUnit } from '../conversion-units/entities/conversion-unit.entity';
import { Order } from '../orders/entities/order.entity';
import { OrderService } from '../orders/order.service';
import { OrderDetail } from './entities/order-detail.entity';
import { CreateOrderDetailInput } from './inputs/create-order-detail.input';
import { UpdateOrderDetailInput } from './inputs/update-order-detail.input';
import { OrderDetailRepository } from './order-detail.repository';

export interface IOrderDetailServiceOptions extends IServiceOptions<OrderDetail> {
  order?: Order;
}

@Injectable()
export class OrderDetailService extends AbstractService<OrderDetail, OrderDetailRepository> {
  private orderService: OrderService;
  private conversionUnitService: ConversionUnitService;

  constructor(
    serviceContext: ServiceContext,
    private readonly orderDetailRepository: OrderDetailRepository,
  ) {
    super(serviceContext, orderDetailRepository);
  }

  protected initializeDependencies() {
    this.orderService = this.moduleRef.get(OrderService, { strict: false });
    this.conversionUnitService = this.moduleRef.get(ConversionUnitService, { strict: false });
  }

  async createOrderDetail(
    data: CreateOrderDetailInput,
    options: IOrderDetailServiceOptions = {},
  ): Promise<OrderDetail | null> {
    try {
      return await this.executeInTransaction(async () => {
        const { order } = options;

        if (!options.order) {
          options.order = await this.fetchOrder(data.order_id);
        }
        if (!order) throw new CustomNotFoundError('Không tìm thấy đơn hàng.');

        const orderDetailExists = await this.getOne({
          where: {
            order_id: order.id,
            product_id: data.product_id,
            variant_id: data.variant_id,
            conversion_unit_id: data.conversion_unit_id,
          },
          withDeleted: true,
        });

        if (orderDetailExists) {
          return await this.updateOrderDetail(
            orderDetailExists.id,
            Object.assign(data, { is_delete: false, deletedBy: null, deletedAt: null }),
            { ...options, model: orderDetailExists },
          );
        }

        const conversionUnitMap = await this.fetchPrices([data.conversion_unit_id]);
        this.summaryOrderDetail(data, conversionUnitMap);

        // Set default status values
        const orderDetailData = {
          ...data,
          order_id: order.id,
          status: data.status || EOrderStatus.PENDING,
          shipping_status: data.shipping_status || EShippingStatus.NOT_REQUIRED,
          payment_status: data.payment_status || EPaymentStatus.UNPAID,
        };

        return await this.create(orderDetailData, options);
      });
    } catch (error) {
      this.logger.error(error, `${this.className}:createOrderDetail`);
      throw error;
    }
  }

  async updateOrderDetail(
    id: number,
    data: UpdateOrderDetailInput,
    options: IOrderDetailServiceOptions = {},
  ): Promise<OrderDetail | null> {
    try {
      return await this.executeInTransaction(async () => {
        if (!options.order) {
          options.order = await this.fetchOrder(data.order_id);
        }
        if (!options.order || options.order.id !== data.order_id)
          throw new CustomNotFoundError('Không tìm thấy dữ liệu.');

        if (!options.model) {
          options.model = await this.getOne({ where: { id } });
        }
        if (!options.model || options.model.id !== id)
          throw new CustomNotFoundError('Không tìm thấy dữ liệu.');

        Object.assign(options.model, data);
        const conversionUnitMap = await this.fetchPrices([data.conversion_unit_id]);
        this.summaryOrderDetail(options.model, conversionUnitMap);

        return await this.update(id, options.model, options);
      });
    } catch (error) {
      this.logger.error(error, `${this.className}:updateOrderDetail`);
      throw error;
    }
  }

  // Private methods

  private summaryOrderDetail(
    orderDetail: OrderDetail | DeepPartial<OrderDetail>,
    conversionUnitMap: Map<number, ConversionUnit>,
  ) {
    const { conversion_unit_id, quantity } = orderDetail;
    const price = conversionUnitMap.get(conversion_unit_id)?.price || 0;
    const serviceFee = 0;
    const tax = 0;
    const discount = 0;

    const totalCost = price * quantity;
    const finalCost = totalCost + serviceFee + tax - discount;

    orderDetail.price = price;
    orderDetail.total_cost = totalCost;
    orderDetail.service_fee = serviceFee;
    orderDetail.tax = tax;
    orderDetail.discount = discount;
    orderDetail.final_cost = finalCost;
  }

  private async fetchOrder(orderId: number): Promise<Order | null> {
    try {
      this.logger.debug(`Fetch order with id: ${orderId}`, `${this.className}:fetchOrder`);

      return await this.orderService.getOne({
        where: { id: orderId },
        relations: { order_details: true },
      });
    } catch (error) {
      this.logger.error(error, `${this.className}:fetchOrder`);
      throw error;
    }
  }

  private async fetchPrices(conversionUnitIds: number[]): Promise<Map<number, ConversionUnit>> {
    try {
      this.logger.debug(
        `Fetch prices with conversionUnitIds: ${conversionUnitIds}`,
        `${this.className}:fetchPrices`,
      );

      const conversionUnits = await this.conversionUnitService.getByIds(conversionUnitIds);

      if (!Array.isArray(conversionUnits) || conversionUnits.length === 0) {
        throw new CustomNotFoundError('Không tìm thấy đơn vị chuyển đổi.');
      }

      return new Map(conversionUnits.map((unit) => [unit.id, unit]));
    } catch (error) {
      this.logger.error(error, `${this.className}:fetchPrices`);
      throw error;
    }
  }
}

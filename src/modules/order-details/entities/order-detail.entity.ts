import { Field, Int, ObjectType, registerEnumType } from '@nestjs/graphql';
import { Column, Entity, JoinColumn, ManyToOne, OneToOne } from 'typeorm';

import { AbstractEntity } from '@/common/abstracts/entity.abstract';
import { MetadataResponse } from '@/common/graphql/metadata.response';
import { EOrderStatus, EPaymentStatus, EShippingStatus } from '@/common/enums/order.enum';
import { OrderShipping } from '@/modules/order-shippings/entities/order-shipping.entity';
import { Order } from '@/modules/orders/entities/order.entity';

registerEnumType(EOrderStatus, {
  name: 'EOrderStatus',
  description: 'Enum for order statuses',
});

registerEnumType(EShippingStatus, {
  name: 'EShippingStatus',
  description: 'Enum for shipping statuses',
});

registerEnumType(EPaymentStatus, {
  name: 'EPaymentStatus',
  description: 'Enum for payment statuses',
});

@ObjectType({ description: 'order_detail' })
@Entity({ name: 'order_details' })
export class OrderDetail extends AbstractEntity {
  @Field(() => Int)
  @Column()
  order_id: number;

  @Field(() => Int)
  @Column()
  product_id: number;

  @Field(() => Int)
  @Column()
  variant_id: number;

  @Field(() => Int)
  @Column()
  conversion_unit_id: number;

  @Field(() => Int, { defaultValue: 0 })
  @Column()
  price: number;

  @Field(() => Int, { defaultValue: 0 })
  @Column()
  quantity: number;

  @Field(() => Int, { defaultValue: 0 })
  @Column()
  total_cost: number;

  @Field(() => Int, { defaultValue: 0 })
  @Column()
  service_fee: number;

  @Field(() => Int, { defaultValue: 0 })
  @Column()
  tax: number;

  @Field(() => Int, { defaultValue: 0 })
  @Column()
  discount: number;

  @Field(() => Int, { defaultValue: 0 })
  @Column()
  final_cost: number;

  @Field(() => String, { nullable: true })
  @Column({ nullable: true })
  note?: string;

  @Field(() => EOrderStatus, { defaultValue: EOrderStatus.PENDING })
  @Column({ type: 'enum', enum: EOrderStatus })
  status: string;

  @Field(() => EShippingStatus, { defaultValue: EShippingStatus.NOT_REQUIRED })
  @Column({ type: 'enum', enum: EShippingStatus })
  shipping_status: string;

  @Field(() => EPaymentStatus, { defaultValue: EPaymentStatus.UNPAID })
  @Column({ type: 'enum', enum: EPaymentStatus })
  payment_status: string;

  @ManyToOne(() => Order, (order) => order.order_details, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'order_id' })
  order: Order;

  @OneToOne(() => OrderShipping, (orderShipping) => orderShipping.orderDetail)
  shipping?: OrderShipping;
}

@ObjectType()
export class GetOrderDetailType {
  @Field(() => MetadataResponse, { nullable: true })
  metadata?: MetadataResponse;

  @Field(() => [OrderDetail], { nullable: true })
  data?: OrderDetail[];
}

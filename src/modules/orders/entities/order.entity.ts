import { Field, Int, ObjectType, registerEnumType } from '@nestjs/graphql';
import { Column, Entity, OneToMany } from 'typeorm';

import { AbstractEntity } from '@/common/abstracts/entity.abstract';
import { MetadataResponse } from '@/common/graphql/metadata.response';
import { EOrderStatus, EPaymentStatus, EShippingStatus } from '@/common/enums/order.enum';
import { OrderDetail } from '@/modules/order-details/entities/order-detail.entity';

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

@ObjectType({ description: 'order' })
@Entity({ name: 'orders' })
export class Order extends AbstractEntity {
  @Field(() => String)
  @Column()
  code: string;

  @Field(() => Int, { nullable: true })
  @Column({ nullable: true })
  customer_id?: number;

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

  @Field(() => Int, { defaultValue: 0 })
  @Column()
  paid: number;

  @Field(() => Int, { defaultValue: 0 })
  @Column()
  remaining: number;

  @Field(() => EOrderStatus, { defaultValue: EOrderStatus.PENDING })
  @Column({ type: 'enum', enum: EOrderStatus })
  status: string;

  @Field(() => EShippingStatus, { defaultValue: EShippingStatus.NOT_REQUIRED })
  @Column({ type: 'enum', enum: EShippingStatus })
  shipping_status: string;

  @Field(() => EPaymentStatus, { defaultValue: EPaymentStatus.UNPAID })
  @Column({ type: 'enum', enum: EPaymentStatus })
  payment_status: string;

  @Field(() => String, { nullable: true })
  @Column({ nullable: true })
  note?: string;

  @OneToMany(() => OrderDetail, (orderDetail) => orderDetail.order, {
    cascade: true,
  })
  order_details: OrderDetail[];
}

@ObjectType()
export class GetOrderType {
  @Field(() => MetadataResponse, { nullable: true })
  metadata?: MetadataResponse;

  @Field(() => [Order], { nullable: true })
  data?: Order[];
}

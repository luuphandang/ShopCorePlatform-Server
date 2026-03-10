import { Field, Int, ObjectType, registerEnumType } from '@nestjs/graphql';
import { Column, Entity } from 'typeorm';

import { AbstractEntity } from '@/common/abstracts/entity.abstract';
import { MetadataResponse } from '@/common/graphql/metadata.response';
import { EOrderStatus, EShippingStatus } from '@/common/enums/order.enum';

registerEnumType(EOrderStatus, {
  name: 'EOrderStatus',
  description: 'Enum for order statuses',
});

registerEnumType(EShippingStatus, {
  name: 'EShippingStatus',
  description: 'Enum for shipping statuses',
});

@ObjectType({ description: 'order_history' })
@Entity({ name: 'order_histories' })
export class OrderHistory extends AbstractEntity {
  @Field(() => Int, { nullable: true })
  @Column({ nullable: true })
  order_id?: number;

  @Field(() => Int, { nullable: true })
  @Column({ nullable: true })
  order_detail_id?: number;

  @Field(() => EOrderStatus, { nullable: true })
  @Column({ type: 'enum', enum: EOrderStatus, nullable: true })
  status?: string;

  @Field(() => EShippingStatus, { nullable: true })
  @Column({ type: 'enum', enum: EShippingStatus, nullable: true })
  shipping_status?: string;
}

@ObjectType()
export class GetOrderHistoryType {
  @Field(() => MetadataResponse, { nullable: true })
  metadata?: MetadataResponse;

  @Field(() => [OrderHistory], { nullable: true })
  data?: OrderHistory[];
}

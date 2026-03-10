import { Field, Float, Int, ObjectType, registerEnumType } from '@nestjs/graphql';
import { Column, Entity, JoinColumn, OneToOne } from 'typeorm';

import { AbstractEntity } from '@/common/abstracts/entity.abstract';
import { MetadataResponse } from '@/common/graphql/metadata.response';
import { EShippingStatus } from '@/common/enums/order.enum';
import { OrderDetail } from '@/modules/order-details/entities/order-detail.entity';

registerEnumType(EShippingStatus, {
  name: 'EShippingStatus',
  description: 'Enum for shipping statuses',
});

@ObjectType({ description: 'order_shipping' })
@Entity({ name: 'order_shippings' })
export class OrderShipping extends AbstractEntity {
  @Field(() => Int)
  @Column()
  order_detail_id: number;

  @Field(() => Int, { nullable: true })
  @Column({ nullable: true })
  address_id?: number;

  @Field(() => String)
  @Column()
  to_name: string;

  @Field(() => String)
  @Column()
  to_phone: string;

  @Field(() => String, { nullable: true })
  @Column({ nullable: true })
  to_email?: string;

  @Field(() => String)
  @Column()
  to_address: string;

  @Field(() => String, { nullable: true })
  @Column({ nullable: true })
  to_ward?: string;

  @Field(() => String, { nullable: true })
  @Column({ nullable: true })
  to_district?: string;

  @Field(() => String, { nullable: true })
  @Column({ nullable: true })
  to_province?: string;

  @Field(() => String, { nullable: true })
  @Column({ nullable: true })
  to_country?: string;

  @Field(() => String, { nullable: true })
  @Column({ nullable: true })
  to_postal_code?: string;

  @Field(() => Float, { nullable: true })
  @Column({ nullable: true })
  to_latitude?: number;

  @Field(() => Float, { nullable: true })
  @Column({ nullable: true })
  to_longitude?: number;

  @Field(() => String, { nullable: true })
  @Column({ nullable: true })
  note?: string;

  @Field(() => Date, { nullable: true })
  @Column({ nullable: true })
  pickup_at?: Date;

  @Field(() => Date, { nullable: true })
  @Column({ nullable: true })
  delivery_at?: Date;

  @Field(() => Date, { nullable: true })
  @Column({ nullable: true })
  return_at?: Date;

  @Field(() => Date, { nullable: true })
  @Column({ nullable: true })
  cancel_at?: Date;

  @Field(() => Date, { nullable: true })
  @Column({ nullable: true })
  completed_at?: Date;

  @Field(() => Date, { nullable: true })
  @Column({ nullable: true })
  estimated_delivery_at?: Date;

  @Field(() => EShippingStatus, { nullable: true })
  @Column({ type: 'enum', enum: EShippingStatus, nullable: true })
  status?: string;

  @OneToOne(() => OrderDetail, (orderDetail) => orderDetail.shipping)
  @JoinColumn({ name: 'order_detail_id' })
  orderDetail?: OrderDetail;
}

@ObjectType()
export class GetOrderShippingType {
  @Field(() => MetadataResponse, { nullable: true })
  metadata?: MetadataResponse;

  @Field(() => [OrderShipping], { nullable: true })
  data?: OrderShipping[];
}

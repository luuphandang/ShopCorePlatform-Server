import { Field, Int, ObjectType, registerEnumType } from '@nestjs/graphql';
import { Column, Entity } from 'typeorm';

import { AbstractEntity } from '@/common/abstracts/entity.abstract';
import { MetadataResponse } from '@/common/graphql/metadata.response';
import { EBookingStatus, EBookingType } from '@/common/enums/booking.enum';

registerEnumType(EBookingType, {
  name: 'EBookingType',
  description: 'Enum for booking type',
});

registerEnumType(EBookingStatus, {
  name: 'EBookingStatus',
  description: 'Enum for booking status',
});

@ObjectType({ description: 'booking' })
@Entity({ name: 'bookings' })
export class Booking extends AbstractEntity {
  @Field(() => Int, { nullable: true })
  @Column({ nullable: true })
  customer_id?: number;

  @Field(() => String)
  @Column()
  name: string;

  @Field(() => String)
  @Column()
  phone: string;

  @Field(() => String)
  @Column()
  email: string;

  @Field(() => EBookingType)
  @Column({ type: 'enum', enum: EBookingType })
  type: string;

  @Field(() => [Int], { nullable: true })
  @Column('int', { array: true, nullable: true })
  category_ids?: number[];

  @Field(() => [Int], { nullable: true })
  @Column('int', { array: true, nullable: true })
  product_ids?: number[];

  @Field(() => Date, { nullable: true })
  @Column({ type: 'timestamp', nullable: true })
  estimated_date?: Date;

  @Field(() => String)
  @Column()
  content: string;

  @Field(() => EBookingStatus)
  @Column({ type: 'enum', enum: EBookingStatus })
  status: string;

  @Field(() => [Int], { nullable: true })
  @Column('int', { array: true, nullable: true })
  attachment_ids?: number[];
}

@ObjectType()
export class GetBookingType {
  @Field(() => MetadataResponse, { nullable: true })
  metadata?: MetadataResponse;

  @Field(() => [Booking], { nullable: true })
  data?: Booking[];
}

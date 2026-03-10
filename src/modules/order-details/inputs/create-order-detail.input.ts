import { Field, InputType, Int, registerEnumType } from '@nestjs/graphql';
import { IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

import { EOrderStatus, EPaymentStatus, EShippingStatus } from '@/common/enums/order.enum';

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

@InputType()
export class CreateOrderDetailInput {
  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsNumber()
  order_id?: number;

  @Field(() => Int)
  @IsNotEmpty()
  @IsNumber()
  product_id: number;

  @Field(() => Int)
  @IsNotEmpty()
  @IsNumber()
  variant_id: number;

  @Field(() => Int)
  @IsNotEmpty()
  @IsNumber()
  conversion_unit_id: number;

  @Field(() => Int)
  @IsOptional()
  @IsNumber()
  price?: number;

  @Field(() => Int)
  @IsNotEmpty()
  @IsNumber()
  quantity: number;

  @Field(() => Int)
  @IsOptional()
  @IsNumber()
  total_cost?: number;

  @Field(() => Int)
  @IsOptional()
  @IsNumber()
  service_fee?: number;

  @Field(() => Int)
  @IsOptional()
  @IsNumber()
  tax?: number;

  @Field(() => Int)
  @IsOptional()
  @IsNumber()
  discount?: number;

  @Field(() => Int)
  @IsOptional()
  @IsNumber()
  final_cost?: number;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  note?: string;

  @Field(() => EOrderStatus, { nullable: true, defaultValue: EOrderStatus.PENDING })
  @IsOptional()
  @IsEnum(EOrderStatus)
  status?: EOrderStatus;

  @Field(() => EShippingStatus, { nullable: true, defaultValue: EShippingStatus.NOT_REQUIRED })
  @IsOptional()
  @IsEnum(EShippingStatus)
  shipping_status?: EShippingStatus;

  @Field(() => EPaymentStatus, { nullable: true, defaultValue: EPaymentStatus.UNPAID })
  @IsOptional()
  @IsEnum(EPaymentStatus)
  payment_status?: EPaymentStatus;
}

@InputType()
export class AssignOrderDetailInput extends CreateOrderDetailInput {
  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsNumber()
  id?: number;
}

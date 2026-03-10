import { Field, InputType, Int, registerEnumType } from '@nestjs/graphql';
import { IsArray, IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

import { EOrderStatus, EPaymentStatus, EShippingStatus } from '@/common/enums/order.enum';
import { CreateOrderDetailInput } from '@/modules/order-details/inputs/create-order-detail.input';
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
export class CreateOrderInput {
  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  code?: string;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsNumber()
  customer_id?: number;

  @Field(() => Int, { nullable: true, defaultValue: 0 })
  @IsNotEmpty()
  @IsNumber()
  total_cost: number;

  @Field(() => Int, { nullable: true, defaultValue: 0 })
  @IsOptional()
  @IsNumber()
  service_fee?: number;

  @Field(() => Int, { nullable: true, defaultValue: 0 })
  @IsOptional()
  @IsNumber()
  tax?: number;

  @Field(() => Int, { nullable: true, defaultValue: 0 })
  @IsOptional()
  @IsNumber()
  discount?: number;

  @Field(() => Int, { nullable: true, defaultValue: 0 })
  @IsNotEmpty()
  @IsNumber()
  final_cost: number;

  @Field(() => EOrderStatus, { nullable: true, defaultValue: EOrderStatus.PENDING })
  @IsOptional()
  @IsEnum(EOrderStatus, {
    message: `Chỉ áp dụng các giá trị ${Object.values(EOrderStatus).join(', ')}!`,
  })
  status: string;

  @Field(() => EShippingStatus, { nullable: true, defaultValue: EShippingStatus.NOT_REQUIRED })
  @IsEnum(EShippingStatus, {
    message: `Chỉ áp dụng các giá trị ${Object.values(EShippingStatus).join(', ')}!`,
  })
  shipping_status: string;

  @Field(() => EPaymentStatus, { nullable: true, defaultValue: EPaymentStatus.UNPAID })
  @IsEnum(EPaymentStatus, {
    message: `Chỉ áp dụng các giá trị ${Object.values(EPaymentStatus).join(', ')}!`,
  })
  payment_status: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  note?: string;

  @Field(() => [CreateOrderDetailInput], { nullable: true })
  @IsOptional()
  @IsArray()
  order_details?: CreateOrderDetailInput[];
}

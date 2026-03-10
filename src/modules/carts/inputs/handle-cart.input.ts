import { Field, InputType, PickType } from '@nestjs/graphql';
import { IsArray, IsOptional, IsString } from 'class-validator';

import { CreateOrderDetailInput } from '@/modules/order-details/inputs/create-order-detail.input';
import { CreateOrderShippingInput } from '@/modules/order-shippings/inputs/create-order-shipping.input';

@InputType()
export class AddToCartInput extends PickType(CreateOrderDetailInput, [
  'product_id',
  'variant_id',
  'conversion_unit_id',
  'quantity',
  'note',
]) {}

@InputType()
export class RemoveFromCartInput extends PickType(CreateOrderDetailInput, [
  'product_id',
  'variant_id',
  'conversion_unit_id',
]) {}

@InputType()
export class CheckoutCartInput extends CreateOrderShippingInput {
  @Field(() => [String], { nullable: true })
  @IsOptional()
  @IsArray()
  vouchers?: string[];

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  note?: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  payment_method?: string;
}

import { Field, InputType, Int, registerEnumType } from '@nestjs/graphql';
import { IsEnum, IsNumber, IsOptional } from 'class-validator';

import { EOrderStatus, EShippingStatus } from '@/common/enums/order.enum';

registerEnumType(EOrderStatus, {
  name: 'EOrderStatus',
  description: 'Enum for order statuses',
});

registerEnumType(EShippingStatus, {
  name: 'EShippingStatus',
  description: 'Enum for shipping statuses',
});

@InputType()
export class CreateOrderHistoryInput {
  @Field(() => Int, { nullable: true })
  @IsNumber()
  @IsOptional()
  order_id?: number;

  @Field(() => Int, { nullable: true })
  @IsNumber()
  @IsOptional()
  order_detail_id?: number;

  @Field(() => EOrderStatus, { nullable: true })
  @IsEnum(EOrderStatus)
  @IsOptional()
  status?: EOrderStatus;

  @Field(() => EShippingStatus, { nullable: true })
  @IsEnum(EShippingStatus)
  @IsOptional()
  shipping_status?: EShippingStatus;
}

@InputType()
export class AssignOrderHistoryInput extends CreateOrderHistoryInput {
  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsNumber()
  id?: number;
}

import { Field, Float, InputType, Int, registerEnumType } from '@nestjs/graphql';
import {
  IsDate,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Matches,
} from 'class-validator';

import { EShippingStatus } from '@/common/enums/order.enum';

registerEnumType(EShippingStatus, {
  name: 'EShippingStatus',
  description: 'Enum for shipping statuses',
});

@InputType()
export class CreateOrderShippingInput {
  @Field(() => Int, { nullable: true })
  @IsOptional()
  order_detail_id?: number;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  address_id?: number;

  @Field(() => String)
  @IsNotEmpty()
  to_name: string;

  @Field(() => String)
  @IsNotEmpty()
  @IsString()
  @Matches(/^\+?[1-9]\d{1,14}$|^0\d{9}$/, {
    message: 'Phone number must be in E!164 format!',
  })
  to_phone: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  to_email?: string;

  @Field(() => String)
  @IsNotEmpty()
  @IsString()
  to_address: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  to_ward?: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  to_district?: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  to_province?: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  to_country?: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  to_postal_code?: string;

  @Field(() => Float, { nullable: true })
  @IsOptional()
  @IsNumber()
  to_latitude?: number;

  @Field(() => Float, { nullable: true })
  @IsOptional()
  @IsNumber()
  to_longitude?: number;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  note?: string;

  @Field(() => Date, { nullable: true })
  @IsOptional()
  @IsDate()
  pickup_at?: Date;

  @Field(() => Date, { nullable: true })
  @IsOptional()
  @IsDate()
  delivery_at?: Date;

  @Field(() => Date, { nullable: true })
  @IsOptional()
  @IsDate()
  return_at?: Date;

  @Field(() => Date, { nullable: true })
  @IsOptional()
  @IsDate()
  cancel_at?: Date;

  @Field(() => Date, { nullable: true })
  @IsOptional()
  @IsDate()
  completed_at?: Date;

  @Field(() => Date, { nullable: true })
  @IsOptional()
  @IsDate()
  estimated_delivery_at?: Date;

  @Field(() => EShippingStatus, { nullable: true })
  @IsOptional()
  @IsEnum(EShippingStatus, {
    message: `Chỉ áp dụng các giá trị ${Object.values(EShippingStatus).join(', ')}!`,
  })
  status?: string;
}

@InputType()
export class AssignOrderShippingInput extends CreateOrderShippingInput {
  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsNumber()
  id?: number;
}

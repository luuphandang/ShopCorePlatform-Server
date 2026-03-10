import { Field, InputType, Int } from '@nestjs/graphql';
import { IsNotEmpty, IsNumber, IsObject, IsOptional, IsString, Min } from 'class-validator';

import { AssignUnitInput } from '@/modules/units/inputs/create-unit.input';

@InputType()
export class CreateConversionUnitInput {
  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsNumber()
  product_id?: number;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsNumber()
  variant_id?: number;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsNumber()
  unit_id?: number;

  @Field(() => Int)
  @IsNotEmpty()
  @IsNumber()
  conversion_rate: number;

  @Field(() => Int)
  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  regular_price: number;

  @Field(() => Int)
  @IsNotEmpty()
  @IsNumber()
  sale_price: number;

  @Field(() => Int)
  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  price: number;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString({ message: 'Mô tả đơn vị cần là chuỗi ký tự' })
  description?: string;

  @Field(() => AssignUnitInput)
  @IsNotEmpty()
  @IsObject()
  unit: AssignUnitInput;
}

@InputType()
export class AssignConversionUnitInput extends CreateConversionUnitInput {
  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsNumber()
  id?: number;
}

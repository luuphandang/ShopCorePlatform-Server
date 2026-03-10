import { Field, InputType, Int } from '@nestjs/graphql';
import { IsArray, IsNumber, IsOptional, IsString } from 'class-validator';

import { AssignProductAttributeValueInput } from '@/modules/product-attribute-values/inputs/create-product-attribute-value.input';

@InputType()
export class CreateProductAttributeInput {
  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString({ message: 'Tên thuộc tính cần là chuỗi ký tự!' })
  name: string;

  @Field(() => [AssignProductAttributeValueInput], { nullable: true })
  @IsOptional()
  @IsArray()
  values?: AssignProductAttributeValueInput[];
}

@InputType()
export class AssignProductAttributeInput extends CreateProductAttributeInput {
  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsNumber()
  id?: number;
}

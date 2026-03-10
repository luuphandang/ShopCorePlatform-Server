import { Field, InputType, Int } from '@nestjs/graphql';
import { IsNumber, IsOptional, IsString } from 'class-validator';

@InputType()
export class CreateProductAttributeValueInput {
  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsNumber()
  attribute_id?: number;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString({ message: 'Giá trị thuộc tính cần là chuỗi ký tự!' })
  value: string;
}

@InputType()
export class AssignProductAttributeValueInput extends CreateProductAttributeValueInput {
  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsNumber()
  id?: number;
}

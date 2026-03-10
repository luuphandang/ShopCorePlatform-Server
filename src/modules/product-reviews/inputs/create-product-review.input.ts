import { Field, InputType, Int } from '@nestjs/graphql';
import { IsArray, IsNotEmpty, IsNumber, IsOptional } from 'class-validator';

@InputType()
export class CreateProductReviewInput {
  @Field(() => Int)
  @IsOptional()
  customer_id: number;

  @Field(() => Int)
  @IsOptional()
  product_id: number;

  @Field(() => Int)
  @IsNotEmpty()
  rate: number;

  @Field(() => String)
  @IsNotEmpty()
  content: string;

  @Field(() => [Int], { nullable: true })
  @IsOptional()
  @IsArray()
  attachment_ids?: number[];
}

@InputType()
export class AssignProductReviewInput extends CreateProductReviewInput {
  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsNumber()
  id?: number;
}

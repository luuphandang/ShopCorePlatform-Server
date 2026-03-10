import { Field, InputType, Int } from '@nestjs/graphql';
import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

@InputType()
export class CreateUnitInput {
  @Field(() => String)
  @IsNotEmpty()
  @IsString({ message: 'Tên đơn vị cần là chuỗi ký tự!' })
  name: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString({ message: 'Mô tả đơn vị cần là chuỗi ký tự' })
  description?: string;
}

@InputType()
export class AssignUnitInput extends CreateUnitInput {
  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsNumber()
  id?: number;
}

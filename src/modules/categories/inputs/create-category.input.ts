import { Field, InputType, Int, registerEnumType } from '@nestjs/graphql';
import { IsArray, IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

import { ECategoryType } from '@/common/enums/category.enum';
import { AssignFileUploadInput } from '@/modules/file-uploads/inputs/create-file-upload.input';

registerEnumType(ECategoryType, {
  name: 'ECategoryType',
  description: 'Enum for category types',
});

@InputType()
export class CreateCategoryInput {
  @Field(() => String, { nullable: true })
  @IsNotEmpty()
  @IsString({ message: 'Tên nhóm cần là chuỗi ký tự!' })
  name: string;

  @Field(() => ECategoryType)
  @IsNotEmpty()
  @IsEnum(ECategoryType, {
    message: `Chỉ áp dụng các giá trị ${Object.values(ECategoryType).join(', ')}!`,
  })
  type: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString({ message: 'Mô tả cần là chuỗi ký tự' })
  short_description?: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString({ message: 'Mô tả cần là chuỗi ký tự' })
  description?: string;

  @Field(() => [String], { nullable: true })
  @IsOptional()
  @IsArray()
  keywords?: string[];

  @Field(() => AssignFileUploadInput, { nullable: true })
  @IsOptional()
  thumbnail?: AssignFileUploadInput;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  parent_id?: number;

  @Field(() => [Int], { nullable: true })
  @IsOptional()
  @IsArray()
  children_ids?: number[];
}

@InputType()
export class AssignCategoryInput extends CreateCategoryInput {
  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsNumber()
  id?: number;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  code?: string;
}

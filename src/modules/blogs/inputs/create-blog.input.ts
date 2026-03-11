import { Field, InputType } from '@nestjs/graphql';
import { IsArray, IsNotEmpty, IsOptional, IsString } from 'class-validator';

import { AllowHtml } from '@/common/decorators/allow-html.decorator';
import { AssignCategoryInput } from '@/modules/categories/inputs/create-category.input';

@InputType()
export class CreateBlogInput {
  @Field(() => String)
  @IsNotEmpty()
  @IsString({ message: 'Tiêu đề bài viết cần là chuỗi ký tự!' })
  title: string;

  @Field(() => String)
  @IsNotEmpty()
  @IsString({ message: 'Nội dung bài viết cần là chuỗi ký tự' })
  @AllowHtml()
  content: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  @AllowHtml()
  short_description?: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  meta_title?: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  meta_description?: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  meta_keywords?: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  meta_robots?: string;

  @Field(() => [AssignCategoryInput], { nullable: true })
  @IsOptional()
  @IsArray()
  categories?: AssignCategoryInput[];
}

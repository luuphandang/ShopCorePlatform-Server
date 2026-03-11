import { Field, InputType, registerEnumType } from '@nestjs/graphql';
import { IsArray, IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';

import { AllowHtml } from '@/common/decorators/allow-html.decorator';
import { EProductStatus, EProductType } from '@/common/enums/product.enum';
import { AssignCategoryInput } from '@/modules/categories/inputs/create-category.input';
import { AssignConversionUnitInput } from '@/modules/conversion-units/inputs/create-conversion-unit.input';
import { AssignFileUploadInput } from '@/modules/file-uploads/inputs/create-file-upload.input';
import { AssignProductAttributeValueInput } from '@/modules/product-attribute-values/inputs/create-product-attribute-value.input';
import { AssignProductAttributeInput } from '@/modules/product-attributes/inputs/create-product-attribute.input';
import { AssignProductVariantInput } from '@/modules/product-variants/inputs/create-product-variant.input';

registerEnumType(EProductStatus, {
  name: 'EProductStatus',
  description: 'Enum for product statuses',
});

registerEnumType(EProductType, {
  name: 'EProductType',
  description: 'Enum for product types',
});

@InputType()
export class CreateProductInput {
  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  code?: string;

  @Field(() => String)
  @IsNotEmpty()
  @IsString()
  name: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  sku?: string;

  @Field(() => EProductType, { nullable: true, defaultValue: EProductType.PRODUCT })
  @IsOptional()
  @IsEnum(EProductType, {
    message: `Chỉ áp dụng các giá trị ${Object.values(EProductType).join(', ')}!`,
  })
  type?: string;

  @Field(() => [String], { nullable: true })
  @IsOptional()
  @IsArray()
  features?: string[];

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  turnaround?: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  @AllowHtml()
  short_description?: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  @AllowHtml()
  description?: string;

  @Field(() => EProductStatus, { nullable: true, defaultValue: EProductStatus.ACTIVATED })
  @IsNotEmpty()
  @IsEnum(EProductStatus, {
    message: `Chỉ áp dụng các giá trị ${Object.values(EProductStatus).join(', ')}!`,
  })
  status?: EProductStatus;

  @Field(() => [AssignCategoryInput], { nullable: true })
  @IsOptional()
  @IsArray()
  categories?: AssignCategoryInput[];

  @Field(() => AssignConversionUnitInput, { nullable: true })
  @IsOptional()
  base_unit?: AssignConversionUnitInput;

  @Field(() => [AssignProductAttributeInput], { nullable: true })
  @IsOptional()
  @IsArray()
  attributes?: AssignProductAttributeInput[];

  @Field(() => [AssignProductAttributeValueInput], { nullable: true })
  @IsOptional()
  @IsArray()
  values?: AssignProductAttributeValueInput[];

  @Field(() => [AssignProductVariantInput], { nullable: true })
  @IsOptional()
  @IsArray()
  variants?: AssignProductVariantInput[];

  @Field(() => [AssignConversionUnitInput], { nullable: true })
  @IsOptional()
  @IsArray()
  conversion_units?: AssignConversionUnitInput[];

  @Field(() => AssignFileUploadInput, { nullable: true })
  @IsOptional()
  thumbnail?: AssignFileUploadInput;

  @Field(() => [AssignFileUploadInput], { nullable: true })
  @IsOptional()
  @IsArray()
  gallery_images?: AssignFileUploadInput[];

  @Field(() => [AssignFileUploadInput], { nullable: true })
  @IsOptional()
  @IsArray()
  attachments?: AssignFileUploadInput[];
}

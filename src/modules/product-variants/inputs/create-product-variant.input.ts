import { Field, InputType, Int, registerEnumType } from '@nestjs/graphql';
import { IsArray, IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

import { AllowHtml } from '@/common/decorators/allow-html.decorator';
import { EProductStatus } from '@/common/enums/product.enum';
import { AssignConversionUnitInput } from '@/modules/conversion-units/inputs/create-conversion-unit.input';
import { AssignFileUploadInput } from '@/modules/file-uploads/inputs/create-file-upload.input';
import { AssignProductAttributeValueInput } from '@/modules/product-attribute-values/inputs/create-product-attribute-value.input';
import { AssignProductAttributeInput } from '@/modules/product-attributes/inputs/create-product-attribute.input';

registerEnumType(EProductStatus, {
  name: 'EProductStatus',
  description: 'Enum for product statuses',
});

@InputType()
export class CreateProductVariantInput {
  @Field(() => String)
  @IsNotEmpty()
  @IsString()
  name: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  sku?: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  code?: string;

  @Field(() => EProductStatus, { nullable: true, defaultValue: EProductStatus.ACTIVATED })
  @IsOptional()
  @IsEnum(EProductStatus)
  status?: EProductStatus;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  @AllowHtml()
  description?: string;

  @Field(() => [AssignFileUploadInput], { nullable: true })
  @IsOptional()
  @IsArray()
  gallery_images?: AssignFileUploadInput[];

  @Field(() => [AssignConversionUnitInput], { nullable: true })
  @IsOptional()
  @IsArray()
  conversion_units?: AssignConversionUnitInput[];

  @Field(() => [AssignProductAttributeInput], { nullable: true })
  @IsOptional()
  @IsArray()
  attributes?: AssignProductAttributeInput[];

  @Field(() => [AssignProductAttributeValueInput], { nullable: true })
  @IsOptional()
  @IsArray()
  values?: AssignProductAttributeValueInput[];
}

@InputType()
export class AssignProductVariantInput extends CreateProductVariantInput {
  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsNumber()
  id?: number;
}

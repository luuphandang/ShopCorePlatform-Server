import { InputType, PartialType } from '@nestjs/graphql';

import { CreateProductAttributeValueInput } from './create-product-attribute-value.input';

@InputType()
export class UpdateProductAttributeValueInput extends PartialType(
  CreateProductAttributeValueInput,
) {}

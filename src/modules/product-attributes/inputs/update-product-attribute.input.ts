import { InputType, PartialType } from '@nestjs/graphql';

import { CreateProductAttributeInput } from './create-product-attribute.input';

@InputType()
export class UpdateProductAttributeInput extends PartialType(CreateProductAttributeInput) {}

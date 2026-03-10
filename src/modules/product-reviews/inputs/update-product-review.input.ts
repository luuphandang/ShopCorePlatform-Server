import { InputType, PartialType } from '@nestjs/graphql';

import { CreateProductReviewInput } from './create-product-review.input';

@InputType()
export class UpdateProductReviewInput extends PartialType(CreateProductReviewInput) {}

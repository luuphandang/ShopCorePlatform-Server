import { InputType, PartialType } from '@nestjs/graphql';

import { CreateOrderDetailInput } from './create-order-detail.input';

@InputType()
export class UpdateOrderDetailInput extends PartialType(CreateOrderDetailInput) {}

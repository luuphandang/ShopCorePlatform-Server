import { InputType, PartialType } from '@nestjs/graphql';

import { CreateOrderShippingInput } from './create-order-shipping.input';

@InputType()
export class UpdateOrderShippingInput extends PartialType(CreateOrderShippingInput) {}

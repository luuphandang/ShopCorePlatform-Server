import { InputType, PartialType } from '@nestjs/graphql';

import { CreateOrderHistoryInput } from './create-order-history.input';

@InputType()
export class UpdateOrderHistoryInput extends PartialType(CreateOrderHistoryInput) {}

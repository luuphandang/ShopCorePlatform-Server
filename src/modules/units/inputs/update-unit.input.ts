import { InputType, PartialType } from '@nestjs/graphql';

import { CreateUnitInput } from './create-unit.input';

@InputType()
export class UpdateUnitInput extends PartialType(CreateUnitInput) {}

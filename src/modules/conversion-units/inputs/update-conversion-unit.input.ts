import { InputType, PartialType } from '@nestjs/graphql';

import { CreateConversionUnitInput } from './create-conversion-unit.input';

@InputType()
export class UpdateConversionUnitInput extends PartialType(CreateConversionUnitInput) {}

import { Field, InputType } from '@nestjs/graphql';
import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

@InputType()
export class CreatePermissionInput {
  @Field(() => String)
  @IsNotEmpty()
  @IsString({ message: 'Label must be a string!' })
  label: string;

  @Field(() => String, { nullable: true })
  @IsNotEmpty()
  @IsString({ message: 'Value must be a string!' })
  value: string;
}

@InputType()
export class AssignPermissionInput extends CreatePermissionInput {
  @Field(() => Number, { nullable: true })
  @IsOptional()
  @IsNumber({}, { message: 'Id must be a number!' })
  id?: number;
}

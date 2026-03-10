import { Field, InputType, PartialType } from '@nestjs/graphql';
import { IsOptional, IsString, MinLength } from 'class-validator';

import { CreateUserInput } from './create-user.input';

@InputType()
export class UpdateUserInput extends PartialType(CreateUserInput) {
  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString({ message: 'Password must be a string!' })
  @MinLength(4, { message: 'Password must be at least 4 characters long!' })
  password?: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString({ message: 'New password must be a string!' })
  @MinLength(4, { message: 'New password must be at least 4 characters long!' })
  new_password?: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString({ message: 'Confirm password must be a string!' })
  @MinLength(4, { message: 'Confirm password must be at least 4 characters long!' })
  confirm_password?: string;
}

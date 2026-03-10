import { Field, InputType } from '@nestjs/graphql';
import { IsArray, IsNotEmpty, IsOptional, IsString, MinLength } from 'class-validator';

import { AssignPermissionInput } from '@/modules/permissions/inputs/create-permission.input';

@InputType()
export class CreateRoleInput {
  @Field(() => String)
  @IsNotEmpty()
  @IsString({ message: 'Username must be a string!' })
  @MinLength(4, { message: 'Username must be at least 4 characters long!' })
  name: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString({ message: 'Description must be a string!' })
  description?: string;

  @Field(() => [AssignPermissionInput], { nullable: true })
  @IsOptional()
  @IsArray()
  permissions?: AssignPermissionInput[];
}

@InputType()
export class AssignRoleInput {
  @Field(() => Number, { nullable: true })
  @IsOptional()
  id?: number;
}

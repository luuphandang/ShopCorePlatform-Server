import { Field, InputType } from '@nestjs/graphql';
import {
  IsArray,
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  MinLength,
} from 'class-validator';

import { AssignFileUploadInput } from '@/modules/file-uploads/inputs/create-file-upload.input';
import { AssignRoleInput } from '@/modules/roles/inputs/create-role.input';

@InputType()
export class CreateUserInput {
  @Field(() => String)
  @IsNotEmpty()
  @IsString({ message: 'Phone must be a string!' })
  @Matches(/^\+?[1-9]\d{1,14}$|^0\d{9}$/, {
    message: 'Phone number must be in E!164 format!',
  })
  phone: string;

  @Field(() => String)
  @IsNotEmpty()
  @IsString({ message: 'Password must be a string!' })
  @MinLength(4, { message: 'Password must be at least 4 characters long!' })
  password: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString({ message: 'First name must be a string!' })
  first_name?: string;

  @Field(() => String)
  @IsNotEmpty()
  @IsString({ message: 'Last name must be a string!' })
  last_name: string;

  @Field(() => String)
  @IsOptional()
  @IsEmail({}, { message: 'Email is not valid!' })
  email?: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString({ message: 'Address must be a string!' })
  address?: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString({ message: 'Birthday must be a string in YYYY-MM-DD format!' })
  @Matches(/^\d{4}-\d{2}-\d{2}$/, { message: 'Birthday must be in YYYY-MM-DD format!' })
  birthday?: string;

  @Field(() => AssignFileUploadInput, { nullable: true })
  @IsOptional()
  avatar?: AssignFileUploadInput;

  @Field(() => [AssignRoleInput], { nullable: true })
  @IsOptional()
  @IsArray()
  roles?: AssignRoleInput[];
}

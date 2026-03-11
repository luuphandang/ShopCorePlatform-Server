import { Field, InputType } from '@nestjs/graphql';
import { IsNotEmpty, IsString, Matches, MinLength } from 'class-validator';

@InputType()
export class SignInInput {
  @Field(() => String)
  @IsNotEmpty()
  phone: string;

  @Field(() => String)
  @IsNotEmpty()
  password: string;
}

@InputType()
export class SignUpInput extends SignInInput {
  @Field(() => String)
  @IsNotEmpty()
  phone: string;

  @Field(() => String)
  @IsNotEmpty()
  @IsString({ message: 'Password must be a string!' })
  @MinLength(8, { message: 'Password must be at least 8 characters long!' })
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/, {
    message: 'Mật khẩu phải có ít nhất 8 ký tự, bao gồm chữ hoa, chữ thường, số và ký tự đặc biệt',
  })
  password: string;

  @Field(() => String)
  @IsNotEmpty()
  last_name: string;
}

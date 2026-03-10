import { Field, ObjectType } from '@nestjs/graphql';

import { User } from '@/modules/users/entities/user.entity';

@ObjectType()
export class CookieOption {
  @Field(() => Boolean, { nullable: true })
  httpOnly?: boolean;

  @Field(() => Boolean, { nullable: true })
  secure?: boolean;

  @Field(() => String, { nullable: true })
  sameSite?: boolean | 'lax' | 'strict' | 'none';

  @Field(() => String, { nullable: true })
  path?: string;

  @Field(() => Number, { nullable: true })
  maxAge?: number;

  @Field(() => String, { nullable: true })
  domain?: string;
}

@ObjectType()
export class JwtWithUser {
  @Field(() => String)
  access_token: string;

  @Field(() => User)
  user: User;

  @Field(() => CookieOption)
  options: CookieOption;
}

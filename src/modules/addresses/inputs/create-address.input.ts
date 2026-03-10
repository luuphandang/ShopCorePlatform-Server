import { Field, Float, InputType, Int } from '@nestjs/graphql';
import { IsBoolean, IsNumber, IsOptional, IsString, Matches } from 'class-validator';

@InputType()
export class CreateAddressInput {
  @Field(() => String)
  @IsOptional()
  name: string;

  @Field(() => String)
  @IsOptional()
  @IsString()
  @Matches(/^\+?[1-9]\d{1,14}$|^0\d{9}$/, {
    message: 'Phone number must be in E!164 format!',
  })
  phone: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  email?: string;

  @Field(() => String)
  @IsOptional()
  @IsString()
  address: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  ward?: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  district?: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  province?: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  country?: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  postal_code?: string;

  @Field(() => Float, { nullable: true })
  @IsOptional()
  @IsNumber()
  latitude?: number;

  @Field(() => Float, { nullable: true })
  @IsOptional()
  @IsNumber()
  longitude?: number;

  @Field(() => Boolean, { nullable: true })
  @IsOptional()
  @IsBoolean()
  is_default?: boolean;
}

@InputType()
export class AssignAddressInput extends CreateAddressInput {
  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsNumber()
  id?: number;
}

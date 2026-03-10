import { Field, InputType, Int, registerEnumType } from '@nestjs/graphql';
import { IsArray, IsOptional, IsString, Matches } from 'class-validator';

import { EAppointmentStatus } from '@/common/enums/appointment.enum';

registerEnumType(EAppointmentStatus, {
  name: 'EAppointmentStatus',
  description: 'Enum for appointment status',
});

@InputType()
export class CreateAppointmentInput {
  @Field(() => Int, { nullable: true })
  @IsOptional()
  customer_id?: number;

  @Field(() => String)
  @IsOptional()
  @IsString()
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
  title: string;

  @Field(() => String)
  @IsOptional()
  @IsString()
  content: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  product_id?: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  product_name?: string;

  @Field(() => [Int], { nullable: true })
  @IsOptional()
  @IsArray()
  attachment_ids?: number[];
}

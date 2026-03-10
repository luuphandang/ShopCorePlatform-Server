import { Field, InputType, Int, registerEnumType } from '@nestjs/graphql';
import {
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Matches,
} from 'class-validator';

import { EBookingStatus, EBookingType } from '@/common/enums/booking.enum';
import { AssignFileUploadInput } from '@/modules/file-uploads/inputs/create-file-upload.input';

registerEnumType(EBookingType, {
  name: 'EBookingType',
  description: 'Enum for booking type',
});

registerEnumType(EBookingStatus, {
  name: 'EBookingStatus',
  description: 'Enum for booking status',
});

@InputType()
export class CreateBookingInput {
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

  @Field(() => EBookingType)
  @IsEnum(EBookingType, {
    message: `Chỉ áp dụng các giá trị ${Object.values(EBookingType).join(', ')}!`,
  })
  type: string;

  @Field(() => [Int], { nullable: true })
  @IsOptional()
  @IsArray()
  @IsNumber({}, { each: true })
  category_ids?: number[];

  @Field(() => [Int], { nullable: true })
  @IsOptional()
  @IsArray()
  @IsNumber({}, { each: true })
  product_ids?: number[];

  @Field(() => String)
  @IsNotEmpty()
  content: string;

  @Field(() => Date, { nullable: true })
  @IsNotEmpty()
  estimated_date?: Date;

  @Field(() => EBookingStatus, { nullable: true, defaultValue: EBookingStatus.PENDING })
  @IsEnum(EBookingStatus, {
    message: `Chỉ áp dụng các giá trị ${Object.values(EBookingStatus).join(', ')}!`,
  })
  status?: string;

  @Field(() => [AssignFileUploadInput], { nullable: true })
  @IsOptional()
  @IsArray()
  attachments?: AssignFileUploadInput[];
}

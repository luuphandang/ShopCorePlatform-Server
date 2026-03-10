import { Field, InputType, Int, registerEnumType } from '@nestjs/graphql';
import { IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

import { EFileStatus, EFileType } from '@/common/enums/file-upload.enum';

registerEnumType(EFileStatus, {
  name: 'EFileStatus',
  description: 'Enum for file upload status',
});

registerEnumType(EFileType, {
  name: 'EFileType',
  description: 'Enum for file upload type',
});

@InputType()
export class CreateFileUploadInput {
  @Field(() => String)
  @IsNotEmpty()
  @IsString({ message: 'Tên file cần là chuỗi ký tự!' })
  name: string;

  @Field(() => String)
  @IsNotEmpty()
  @IsString({ message: 'Url cần là chuỗi ký tự!' })
  url: string;

  @Field(() => EFileType)
  @IsNotEmpty()
  @IsEnum(EFileType, {
    message: `Chỉ áp dụng các giá trị ${Object.values(EFileType).join(', ')}!`,
  })
  type: string;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsNumber()
  size?: number;

  @Field(() => EFileStatus, { nullable: true, defaultValue: EFileStatus.ACTIVATED })
  @IsOptional()
  @IsEnum(EFileStatus, {
    message: `Chỉ áp dụng các giá trị ${Object.values(EFileStatus).join(', ')}!`,
  })
  status?: string;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsNumber()
  owner_by?: number;
}

@InputType()
export class AssignFileUploadInput extends CreateFileUploadInput {
  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsNumber()
  id?: number;
}

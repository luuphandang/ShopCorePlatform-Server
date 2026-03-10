import { Field, InputType, ObjectType, registerEnumType } from '@nestjs/graphql';
import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';

import { EFileEntity } from '@/common/enums/file-upload.enum';

import { FileUpload } from '../entities/file-upload.entity';

registerEnumType(EFileEntity, {
  name: 'EFileEntity',
  description: 'Enum for file upload entity',
});

@InputType()
export class SignedUrlInput {
  @Field(() => String)
  @IsNotEmpty()
  @IsString({ message: 'Tên file cần là chuỗi ký tự!' })
  file_name: string;

  @Field(() => String)
  @IsNotEmpty()
  @IsString({ message: 'Loại file cần là chuỗi ký tự!' })
  file_type: string;

  @Field(() => Number, { nullable: true })
  @IsOptional()
  owner_by?: number;
}

@InputType()
export class AdminSignedUrlInput extends SignedUrlInput {
  @Field(() => EFileEntity)
  @IsNotEmpty()
  @IsEnum(EFileEntity, {
    message: `Chỉ áp dụng các giá trị ${Object.values(EFileEntity).join(', ')}!`,
  })
  entity: EFileEntity;
}

@ObjectType()
export class SignedUrlResponse {
  @Field(() => FileUpload, { nullable: true })
  file_upload?: FileUpload;

  @Field(() => String, { nullable: true })
  signed_url?: string;
}

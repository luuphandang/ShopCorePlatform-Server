import { Logger } from '@nestjs/common';
import { Field, Int, ObjectType, registerEnumType } from '@nestjs/graphql';
import slugify from 'slugify';
import { BeforeInsert, BeforeUpdate, Column, Entity } from 'typeorm';

import { AbstractEntity } from '@/common/abstracts/entity.abstract';
import { MetadataResponse } from '@/common/graphql/metadata.response';
import { EFileStatus, EFileType } from '@/common/enums/file-upload.enum';

registerEnumType(EFileStatus, {
  name: 'EFileStatus',
  description: 'Enum for file upload status',
});

registerEnumType(EFileType, {
  name: 'EFileType',
  description: 'Enum for file upload type',
});

@ObjectType({ description: 'file_upload' })
@Entity({ name: 'file_uploads' })
export class FileUpload extends AbstractEntity {
  @Field(() => String)
  @Column()
  name: string;

  @Field(() => String)
  @Column()
  slug: string;

  @Field(() => String)
  @Column()
  url: string;

  @Field(() => EFileType)
  @Column({ type: 'enum', enum: EFileType })
  type: string;

  @Field(() => Int, { nullable: true })
  @Column({ nullable: true })
  size?: number;

  @Field(() => EFileStatus)
  @Column({ type: 'enum', enum: EFileStatus })
  status: string;

  @Field(() => Int, { nullable: true })
  @Column({ nullable: true })
  owner_by?: number;

  @BeforeInsert()
  @BeforeUpdate()
  async beforeInsertOrUpdate(): Promise<void> {
    try {
      this.slug = slugify(this.name, { trim: true, lower: true });
    } catch (error) {
      new Logger(FileUpload.name).error(error);
      throw error;
    }
  }
}

@ObjectType()
export class GetFileUploadType {
  @Field(() => MetadataResponse, { nullable: true })
  metadata?: MetadataResponse;

  @Field(() => [FileUpload], { nullable: true })
  data?: FileUpload[];
}

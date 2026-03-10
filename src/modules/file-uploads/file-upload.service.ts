import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ModuleRef } from '@nestjs/core';
import { DeepPartial } from 'typeorm';

import { AbstractService, IServiceOptions } from '@/common/abstracts/service.abstract';
import { EnvironmentVariables } from '@/common/helpers/env.validation';
import { AppLogger } from '@/common/logger/logger.service';
import { RabbitMQService } from '@/common/rabbitmq/rabbitmq.service';
import { EFileClient, EFileStatus, EFileType } from '@/common/enums/file-upload.enum';
import { UtilService } from '@/common/utils/util.service';

import { FileUpload } from './entities/file-upload.entity';
import { FileUploadRepository } from './file-upload.repository';
import { CreateFileUploadInput } from './inputs/create-file-upload.input';
import { AdminSignedUrlInput, SignedUrlInput, SignedUrlResponse } from './inputs/signed-url.input';
import { RedisService } from '@/common/redis/redis.service';

@Injectable()
export class FileUploadService extends AbstractService<FileUpload, FileUploadRepository> {
  constructor(
    configService: ConfigService<EnvironmentVariables>,
    utilService: UtilService,
    appLogger: AppLogger,
    rabbitMQService: RabbitMQService,
    redisService: RedisService,
    moduleRef: ModuleRef,

    private readonly fileUploadRepository: FileUploadRepository,
  ) {
    super(configService, utilService, appLogger, rabbitMQService, redisService, moduleRef, fileUploadRepository);
  }

  protected initializeDependencies() {}

  async websiteSignedUrl(
    data: SignedUrlInput,
    options: IServiceOptions<FileUpload> = {},
  ): Promise<SignedUrlResponse> {
    const { performedBy } = options;
    const uniqueFileName = this.generateUniqueFileName(data.file_name);
    const fileName = this.getFileName(data.file_name);
    const fileType = this.getFileType(data.file_type);
    const userCode = performedBy?.code || 'anonymous';
    const key = this.getFilePath([
      this.config.getString('NODE_ENV'),
      EFileClient.WEBSITE,
      fileType,
      userCode,
      uniqueFileName,
    ]);

    return await this.getSignedUrl(
      {
        name: fileName,
        type: fileType,
        owner_by: data.owner_by || performedBy?.id,
        key,
        contentType: data.file_type,
      },
      options,
    );
  }

  async adminSignedUrl(
    data: AdminSignedUrlInput,
    options: IServiceOptions<FileUpload> = {},
  ): Promise<SignedUrlResponse> {
    const { performedBy } = options;
    const uniqueFileName = this.generateUniqueFileName(data.file_name);
    const fileName = this.getFileName(data.file_name);
    const fileType = this.getFileType(data.file_type);
    const key = this.getFilePath([
      this.config.getString('NODE_ENV'),
      EFileClient.ADMIN,
      fileType,
      data.entity,
      uniqueFileName,
    ]);

    return await this.getSignedUrl(
      {
        name: fileName,
        type: fileType,
        owner_by: data.owner_by || performedBy?.id,
        key,
        contentType: data.file_type,
      },
      options,
    );
  }

  async createFileUpload(
    data: CreateFileUploadInput,
    options: IServiceOptions<FileUpload> = {},
  ): Promise<FileUpload> {
    try {
      return await this.executeInTransaction(async () => {
        const { performedBy } = options;

        return await this.create(
          {
            ...data,
            ...(!data?.status && { status: EFileStatus.ACTIVATED }),
            ...(!data?.owner_by && { owner_by: performedBy?.id }),
          },
          options,
        );
      });
    } catch (error) {
      this.logger.error(error, `${this.className}:createFileUpload`);
      throw error;
    }
  }

  private async getSignedUrl(
    data: DeepPartial<FileUpload> & { key: string; contentType: string },
    options: IServiceOptions<FileUpload> = {},
  ): Promise<SignedUrlResponse> {
    try {
      return await this.executeInTransaction(async () => {
        const command = new PutObjectCommand({
          Bucket: this.bucketName,
          Key: data.key,
          ContentType: data.contentType,
        });

        const signedUrl = await getSignedUrl(this.s3Client, command, {
          expiresIn: this.signedUrlExpiresIn,
        });

        const fileUrl = new URL(signedUrl);
        const newFileUpload = await this.createFileUpload(
          {
            name: data.name,
            type: data.type,
            url: `${fileUrl.protocol}//${fileUrl.host}${fileUrl.pathname}`,
            size: 0,
            owner_by: data.owner_by,
          },
          options,
        );

        return {
          file_upload: newFileUpload,
          signed_url: signedUrl,
        };
      });
    } catch (error) {
      this.logger.error(error, `${this.className}:getSignedUrl`);
      throw error;
    }
  }

  private get s3Client() {
    return new S3Client({
      region: this.config.getString('AWS_S3_REGION'),
      credentials: {
        accessKeyId: this.config.getString('AWS_S3_ACCESS_KEY'),
        secretAccessKey: this.config.getString('AWS_S3_SECRET_KEY'),
      },
      endpoint: this.config.getString('AWS_S3_ENDPOINT'),
    });
  }

  private get bucketName() {
    return this.config.getString('AWS_S3_BUCKET_NAME');
  }

  private get signedUrlExpiresIn() {
    return this.config.getNumber('SIGNED_URL_EXPIRES_IN');
  }

  private generateUniqueFileName(fileName: string) {
    const baseName = this.util.slugify(fileName.split('.').slice(0, -1).join('-'));
    const extension = fileName.split('.').pop();

    const randomString = this.util.generateCode('file').toLowerCase();

    return `${randomString}-${baseName}.${extension}`;
  }

  private getFileName(fileName: string) {
    return fileName.split('.').slice(0, -1).join(' ');
  }

  private getFilePath(paths: string[]) {
    return paths.join('/').toLowerCase();
  }

  private getFileType(fileType: string) {
    if (fileType.startsWith('image/')) return EFileType.IMAGE;
    if (fileType.startsWith('video/')) return EFileType.VIDEO;
    if (fileType === 'application/pdf') return EFileType.PDF;
    if (
      fileType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
      fileType === 'application/msword'
    )
      return EFileType.WORD;
    if (
      fileType === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
      fileType === 'application/vnd.ms-excel'
    )
      return EFileType.EXCEL;
    if (
      fileType === 'application/vnd.openxmlformats-officedocument.presentationml.presentation' ||
      fileType === 'application/vnd.ms-powerpoint'
    )
      return EFileType.POWERPOINT;
    if (fileType === 'text/plain' || fileType === 'text/csv' || fileType === 'text/html')
      return EFileType.TEXT;
    if (
      fileType === 'application/zip' ||
      fileType === 'application/x-rar-compressed' ||
      fileType === 'application/x-7z-compressed' ||
      fileType === 'application/x-tar' ||
      fileType === 'application/gzip'
    )
      return EFileType.ARCHIVE;

    return EFileType.OTHER;
  }
}

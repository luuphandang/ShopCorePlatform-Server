import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { FileUpload } from './entities/file-upload.entity';
import { FileUploadRepository } from './file-upload.repository';
import { FileUploadResolver } from './file-upload.resolver';
import { FileUploadService } from './file-upload.service';
import { FileUploadEventsController } from './file-upload-events.controller';

@Module({
  imports: [TypeOrmModule.forFeature([FileUpload])],
  providers: [
    FileUploadEventsController,
    FileUploadResolver,
    FileUploadService,
    FileUploadRepository,
  ],
  controllers: [FileUploadEventsController],
  exports: [FileUploadService, FileUploadRepository],
})
export class FileUploadModule {}

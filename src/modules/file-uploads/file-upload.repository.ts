import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { AbstractRepository } from '@/common/abstracts/repository.abstract';
import { RepositoryContext } from '@/common/contexts';

import { FileUpload } from './entities/file-upload.entity';

@Injectable()
export class FileUploadRepository extends AbstractRepository<FileUpload> {
  constructor(
    repoContext: RepositoryContext,
    @InjectRepository(FileUpload)
    fileUploadRepository: Repository<FileUpload>,
  ) {
    super(repoContext, fileUploadRepository);
  }
}

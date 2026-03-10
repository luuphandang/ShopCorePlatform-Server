import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { AbstractRepository } from '@/common/abstracts/repository.abstract';
import { RepositoryContext } from '@/common/contexts';

import { Blog } from './entities/blog.entity';

@Injectable()
export class BlogRepository extends AbstractRepository<Blog> {
  constructor(
    repoContext: RepositoryContext,
    @InjectRepository(Blog)
    blogRepository: Repository<Blog>,
  ) {
    super(repoContext, blogRepository);
  }
}

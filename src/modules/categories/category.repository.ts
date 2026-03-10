import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { AbstractRepository } from '@/common/abstracts/repository.abstract';
import { RepositoryContext } from '@/common/contexts';

import { Category } from './entities/category.entity';

@Injectable()
export class CategoryRepository extends AbstractRepository<Category> {
  constructor(
    repoContext: RepositoryContext,
    @InjectRepository(Category)
    categoryRepository: Repository<Category>,
  ) {
    super(repoContext, categoryRepository);
  }
}

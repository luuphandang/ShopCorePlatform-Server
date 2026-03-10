import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { AbstractRepository } from '@/common/abstracts/repository.abstract';
import { RepositoryContext } from '@/common/contexts';

import { ProductAttribute } from './entities/product-attribute.entity';

@Injectable()
export class ProductAttributeRepository extends AbstractRepository<ProductAttribute> {
  constructor(
    repoContext: RepositoryContext,
    @InjectRepository(ProductAttribute)
    productAttributeRepository: Repository<ProductAttribute>,
  ) {
    super(repoContext, productAttributeRepository);
  }
}

import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { AbstractRepository } from '@/common/abstracts/repository.abstract';
import { RepositoryContext } from '@/common/contexts';

import { ProductAttributeValue } from './entities/product-attribute-value.entity';

@Injectable()
export class ProductAttributeValueRepository extends AbstractRepository<ProductAttributeValue> {
  constructor(
    repoContext: RepositoryContext,
    @InjectRepository(ProductAttributeValue)
    productAttributeValueRepository: Repository<ProductAttributeValue>,
  ) {
    super(repoContext, productAttributeValueRepository);
  }
}

import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { AbstractRepository } from '@/common/abstracts/repository.abstract';
import { RepositoryContext } from '@/common/contexts';

import { ProductVariant } from './entities/product-variant.entity';

@Injectable()
export class ProductVariantRepository extends AbstractRepository<ProductVariant> {
  constructor(
    repoContext: RepositoryContext,
    @InjectRepository(ProductVariant)
    productVariantRepository: Repository<ProductVariant>,
  ) {
    super(repoContext, productVariantRepository);
  }
}

import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { AbstractRepository } from '@/common/abstracts/repository.abstract';
import { RepositoryContext } from '@/common/contexts';

import { Product } from './entities/product.entity';

@Injectable()
export class ProductRepository extends AbstractRepository<Product> {
  constructor(
    repoContext: RepositoryContext,
    @InjectRepository(Product)
    productRepository: Repository<Product>,
  ) {
    super(repoContext, productRepository);
  }
}

import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { AbstractRepository } from '@/common/abstracts/repository.abstract';
import { RepositoryContext } from '@/common/contexts';

import { ProductReview } from './entities/product-review.entity';

@Injectable()
export class ProductReviewRepository extends AbstractRepository<ProductReview> {
  constructor(
    repoContext: RepositoryContext,
    @InjectRepository(ProductReview)
    productReviewRepository: Repository<ProductReview>,
  ) {
    super(repoContext, productReviewRepository);
  }
}

import { Injectable } from '@nestjs/common';

import { AbstractService } from '@/common/abstracts/service.abstract';
import { ServiceContext } from '@/common/contexts';

import { ProductReview } from './entities/product-review.entity';
import { ProductReviewRepository } from './product-review.repository';

@Injectable()
export class ProductReviewService extends AbstractService<ProductReview, ProductReviewRepository> {
  constructor(
    serviceContext: ServiceContext,
    productReviewRepository: ProductReviewRepository,
  ) {
    super(serviceContext, productReviewRepository);
  }

  protected initializeDependencies() {}
}

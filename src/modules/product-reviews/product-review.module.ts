import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ProductReview } from './entities/product-review.entity';
import { ProductReviewRepository } from './product-review.repository';
import { ProductReviewResolver } from './product-review.resolver';
import { ProductReviewService } from './product-review.service';
import { ProductReviewEventsController } from './product-review-events.controller';

@Module({
  imports: [TypeOrmModule.forFeature([ProductReview])],
  providers: [
    ProductReviewEventsController,
    ProductReviewResolver,
    ProductReviewService,
    ProductReviewRepository,
  ],
  controllers: [ProductReviewEventsController],
  exports: [ProductReviewService, ProductReviewResolver],
})
export class ProductReviewModule {}

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ProductVariant } from './entities/product-variant.entity';
import { ProductVariantRepository } from './product-variant.repository';
import { ProductVariantResolver } from './product-variant.resolver';
import { ProductVariantService } from './product-variant.service';
import { ProductVariantEventsController } from './product-variant-events.controller';

@Module({
  imports: [TypeOrmModule.forFeature([ProductVariant])],
  providers: [
    ProductVariantEventsController,
    ProductVariantResolver,
    ProductVariantService,
    ProductVariantRepository,
  ],
  controllers: [ProductVariantEventsController],
  exports: [ProductVariantService, ProductVariantResolver],
})
export class ProductVariantModule {}

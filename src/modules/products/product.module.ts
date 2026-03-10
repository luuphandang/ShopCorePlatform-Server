import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Category } from '../categories/entities/category.entity';
import { ConversionUnit } from '../conversion-units/entities/conversion-unit.entity';
import { ProductAttribute } from '../product-attributes/entities/product-attribute.entity';
import { ProductVariant } from '../product-variants/entities/product-variant.entity';
import { Product } from './entities/product.entity';
import { ProductRepository } from './product.repository';
import { ProductResolver } from './product.resolver';
import { ProductService } from './product.service';
import { ProductEventsController } from './product-events.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([Product, Category, ProductAttribute, ProductVariant, ConversionUnit]),
  ],
  providers: [ProductEventsController, ProductResolver, ProductService, ProductRepository],
  controllers: [ProductEventsController],
  exports: [ProductService, ProductRepository],
})
export class ProductModule {}

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ProductAttribute } from './entities/product-attribute.entity';
import { ProductAttributeRepository } from './product-attribute.repository';
import { ProductAttributeResolver } from './product-attribute.resolver';
import { ProductAttributeService } from './product-attribute.service';
import { ProductAttributeEventsController } from './product-attribute-events.controller';

@Module({
  imports: [TypeOrmModule.forFeature([ProductAttribute])],
  providers: [
    ProductAttributeEventsController,
    ProductAttributeResolver,
    ProductAttributeService,
    ProductAttributeRepository,
  ],
  controllers: [ProductAttributeEventsController],
  exports: [ProductAttributeService, ProductAttributeRepository],
})
export class ProductAttributeModule {}

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ProductAttributeValue } from './entities/product-attribute-value.entity';
import { ProductAttributeValueRepository } from './product-attribute-value.repository';
import { ProductAttributeValueResolver } from './product-attribute-value.resolver';
import { ProductAttributeValueService } from './product-attribute-value.service';
import { ProductAttributeValueEventsController } from './product-attribute-value-events.controller';

@Module({
  imports: [TypeOrmModule.forFeature([ProductAttributeValue])],
  providers: [
    ProductAttributeValueEventsController,
    ProductAttributeValueResolver,
    ProductAttributeValueService,
    ProductAttributeValueRepository,
  ],
  controllers: [ProductAttributeValueEventsController],
  exports: [ProductAttributeValueService, ProductAttributeValueRepository],
})
export class ProductAttributeValueModule {}

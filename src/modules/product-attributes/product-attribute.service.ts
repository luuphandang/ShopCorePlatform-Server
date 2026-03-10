import { Injectable } from '@nestjs/common';

import { AbstractService } from '@/common/abstracts/service.abstract';
import { ServiceContext } from '@/common/contexts';

import { ProductAttribute } from './entities/product-attribute.entity';
import { ProductAttributeRepository } from './product-attribute.repository';

@Injectable()
export class ProductAttributeService extends AbstractService<
  ProductAttribute,
  ProductAttributeRepository
> {
  constructor(
    serviceContext: ServiceContext,
    private readonly productAttributeRepository: ProductAttributeRepository,
  ) {
    super(serviceContext, productAttributeRepository);
  }

  protected initializeDependencies() {}
}

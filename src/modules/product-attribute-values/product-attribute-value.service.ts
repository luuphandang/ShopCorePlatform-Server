import { Injectable } from '@nestjs/common';

import { AbstractService } from '@/common/abstracts/service.abstract';
import { ServiceContext } from '@/common/contexts';

import { ProductAttributeValue } from './entities/product-attribute-value.entity';
import { ProductAttributeValueRepository } from './product-attribute-value.repository';

@Injectable()
export class ProductAttributeValueService extends AbstractService<
  ProductAttributeValue,
  ProductAttributeValueRepository
> {
  constructor(
    serviceContext: ServiceContext,
    private readonly productAttributeValueRepository: ProductAttributeValueRepository,
  ) {
    super(serviceContext, productAttributeValueRepository);
  }

  protected initializeDependencies() {}
}

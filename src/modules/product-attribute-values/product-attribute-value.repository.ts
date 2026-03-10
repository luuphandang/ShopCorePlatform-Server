import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';

import { AbstractRepository } from '@/common/abstracts/repository.abstract';
import { EnvironmentVariables } from '@/common/helpers/env.validation';
import { AppLogger } from '@/common/logger/logger.service';
import { UtilService } from '@/common/utils/util.service';

import { ProductAttributeValue } from './entities/product-attribute-value.entity';

@Injectable()
export class ProductAttributeValueRepository extends AbstractRepository<ProductAttributeValue> {
  constructor(
    configService: ConfigService<EnvironmentVariables>,
    utilService: UtilService,
    appLogger: AppLogger,

    dataSource: DataSource,
    @InjectRepository(ProductAttributeValue)
    private readonly productAttributeValueRepository: Repository<ProductAttributeValue>,
  ) {
    super(configService, utilService, appLogger, dataSource, productAttributeValueRepository);
  }
}

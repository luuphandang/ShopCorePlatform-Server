import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';

import { AbstractRepository } from '@/common/abstracts/repository.abstract';
import { EnvironmentVariables } from '@/common/helpers/env.validation';
import { AppLogger } from '@/common/logger/logger.service';
import { UtilService } from '@/common/utils/util.service';

import { ProductVariant } from './entities/product-variant.entity';

@Injectable()
export class ProductVariantRepository extends AbstractRepository<ProductVariant> {
  constructor(
    configService: ConfigService<EnvironmentVariables>,
    utilService: UtilService,
    appLogger: AppLogger,

    dataSource: DataSource,
    @InjectRepository(ProductVariant)
    private readonly productVariantRepository: Repository<ProductVariant>,
  ) {
    super(configService, utilService, appLogger, dataSource, productVariantRepository);
  }
}

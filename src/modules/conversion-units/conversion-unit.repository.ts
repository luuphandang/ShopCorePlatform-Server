import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';

import { AbstractRepository } from '@/common/abstracts/repository.abstract';
import { EnvironmentVariables } from '@/common/helpers/env.validation';
import { AppLogger } from '@/common/logger/logger.service';
import { UtilService } from '@/common/utils/util.service';

import { ConversionUnit } from './entities/conversion-unit.entity';

@Injectable()
export class ConversionUnitRepository extends AbstractRepository<ConversionUnit> {
  constructor(
    configService: ConfigService<EnvironmentVariables>,
    utilService: UtilService,
    appLogger: AppLogger,

    dataSource: DataSource,
    @InjectRepository(ConversionUnit)
    private readonly conversionUnitRepository: Repository<ConversionUnit>,
  ) {
    super(configService, utilService, appLogger, dataSource, conversionUnitRepository);
  }
}

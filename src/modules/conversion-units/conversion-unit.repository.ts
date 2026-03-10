import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { AbstractRepository } from '@/common/abstracts/repository.abstract';
import { RepositoryContext } from '@/common/contexts';

import { ConversionUnit } from './entities/conversion-unit.entity';

@Injectable()
export class ConversionUnitRepository extends AbstractRepository<ConversionUnit> {
  constructor(
    repoContext: RepositoryContext,
    @InjectRepository(ConversionUnit)
    conversionUnitRepository: Repository<ConversionUnit>,
  ) {
    super(repoContext, conversionUnitRepository);
  }
}

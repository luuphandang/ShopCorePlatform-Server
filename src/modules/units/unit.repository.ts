import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { AbstractRepository } from '@/common/abstracts/repository.abstract';
import { RepositoryContext } from '@/common/contexts';

import { Unit } from './entities/unit.entity';

@Injectable()
export class UnitRepository extends AbstractRepository<Unit> {
  constructor(
    repoContext: RepositoryContext,
    @InjectRepository(Unit)
    unitRepository: Repository<Unit>,
  ) {
    super(repoContext, unitRepository);
  }
}

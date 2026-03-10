import { Injectable } from '@nestjs/common';

import { AbstractService } from '@/common/abstracts/service.abstract';
import { ServiceContext } from '@/common/contexts';

import { Unit } from './entities/unit.entity';
import { UnitRepository } from './unit.repository';

@Injectable()
export class UnitService extends AbstractService<Unit, UnitRepository> {
  constructor(
    serviceContext: ServiceContext,
    private readonly unitRepository: UnitRepository,
  ) {
    super(serviceContext, unitRepository);
  }

  protected initializeDependencies() {}
}

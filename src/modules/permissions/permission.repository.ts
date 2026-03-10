import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { AbstractRepository } from '@/common/abstracts/repository.abstract';
import { RepositoryContext } from '@/common/contexts';

import { Permission } from './entities/permission.entity';

@Injectable()
export class PermissionRepository extends AbstractRepository<Permission> {
  constructor(
    repoContext: RepositoryContext,
    @InjectRepository(Permission)
    permissionRepository: Repository<Permission>,
  ) {
    super(repoContext, permissionRepository);
  }
}

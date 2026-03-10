import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { AbstractRepository } from '@/common/abstracts/repository.abstract';
import { RepositoryContext } from '@/common/contexts';

import { Role } from './entities/role.entity';

@Injectable()
export class RoleRepository extends AbstractRepository<Role> {
  constructor(
    repoContext: RepositoryContext,
    @InjectRepository(Role)
    roleRepository: Repository<Role>,
  ) {
    super(repoContext, roleRepository);
  }
}

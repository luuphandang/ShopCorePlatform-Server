import { Injectable } from '@nestjs/common';

import { AbstractService } from '@/common/abstracts/service.abstract';
import { ServiceContext } from '@/common/contexts';

import { Permission } from './entities/permission.entity';
import { PermissionRepository } from './permission.repository';

@Injectable()
export class PermissionService extends AbstractService<Permission, PermissionRepository> {
  constructor(
    serviceContext: ServiceContext,
    private readonly permissionRepository: PermissionRepository,
  ) {
    super(serviceContext, permissionRepository);
  }

  protected initializeDependencies() {}
}

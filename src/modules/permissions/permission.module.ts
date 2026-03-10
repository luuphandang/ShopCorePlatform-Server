import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Permission } from './entities/permission.entity';
import { PermissionRepository } from './permission.repository';
import { PermissionResolver } from './permission.resolver';
import { PermissionService } from './permission.service';
import { PermissionEventsController } from './permission-events.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Permission])],
  providers: [
    PermissionEventsController,
    PermissionResolver,
    PermissionService,
    PermissionRepository,
  ],
  controllers: [PermissionEventsController],
  exports: [PermissionService, PermissionRepository],
})
export class PermissionModule {}

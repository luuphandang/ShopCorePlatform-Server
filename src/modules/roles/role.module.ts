import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Permission } from '../permissions/entities/permission.entity';
import { Role } from './entities/role.entity';
import { RoleRepository } from './role.repository';
import { RoleResolver } from './role.resolver';
import { RoleService } from './role.service';
import { RoleEventsController } from './role-events.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Role, Permission])],
  providers: [RoleEventsController, RoleResolver, RoleService, RoleRepository],
  controllers: [RoleEventsController],
  exports: [RoleService, RoleRepository],
})
export class RoleModule {}

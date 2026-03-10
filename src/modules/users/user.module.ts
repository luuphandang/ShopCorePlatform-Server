import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Role } from '../roles/entities/role.entity';
import { User } from './entities/user.entity';
import { UserRepository } from './user.repository';
import { UserResolver } from './user.resolver';
import { UserService } from './user.service';
import { UserEventsController } from './user-events.controller';

@Module({
  imports: [TypeOrmModule.forFeature([User, Role])],
  providers: [UserEventsController, UserResolver, UserService, UserRepository],
  controllers: [UserEventsController],
  exports: [UserService, UserRepository],
})
export class UserModule {}

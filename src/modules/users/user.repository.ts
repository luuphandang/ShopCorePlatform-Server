import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { AbstractRepository } from '@/common/abstracts/repository.abstract';
import { RepositoryContext } from '@/common/contexts';

import { User } from './entities/user.entity';

@Injectable()
export class UserRepository extends AbstractRepository<User> {
  constructor(
    repoContext: RepositoryContext,
    @InjectRepository(User)
    userRepository: Repository<User>,
  ) {
    super(repoContext, userRepository);
  }
}

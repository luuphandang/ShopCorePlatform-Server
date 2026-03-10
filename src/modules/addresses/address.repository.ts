import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { AbstractRepository } from '@/common/abstracts/repository.abstract';
import { RepositoryContext } from '@/common/contexts';

import { Address } from './entities/address.entity';

@Injectable()
export class AddressRepository extends AbstractRepository<Address> {
  constructor(
    repoContext: RepositoryContext,
    @InjectRepository(Address)
    addressRepository: Repository<Address>,
  ) {
    super(repoContext, addressRepository);
  }
}

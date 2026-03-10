import { Injectable } from '@nestjs/common';

import { AbstractService } from '@/common/abstracts/service.abstract';
import { ServiceContext } from '@/common/contexts';

import { AddressRepository } from './address.repository';
import { Address } from './entities/address.entity';

@Injectable()
export class AddressService extends AbstractService<Address, AddressRepository> {
  constructor(
    serviceContext: ServiceContext,
    private readonly addressRepository: AddressRepository,
  ) {
    super(serviceContext, addressRepository);
  }

  protected initializeDependencies() {}
}

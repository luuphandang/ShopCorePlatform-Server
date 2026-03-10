import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { AbstractRepository } from '@/common/abstracts/repository.abstract';
import { RepositoryContext } from '@/common/contexts';

import { Booking } from './entities/booking.entity';

@Injectable()
export class BookingRepository extends AbstractRepository<Booking> {
  constructor(
    repoContext: RepositoryContext,
    @InjectRepository(Booking)
    bookingRepository: Repository<Booking>,
  ) {
    super(repoContext, bookingRepository);
  }
}

import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { AbstractRepository } from '@/common/abstracts/repository.abstract';
import { RepositoryContext } from '@/common/contexts';

import { Appointment } from './entities/appointment.entity';

@Injectable()
export class AppointmentRepository extends AbstractRepository<Appointment> {
  constructor(
    repoContext: RepositoryContext,
    @InjectRepository(Appointment)
    appointmentRepository: Repository<Appointment>,
  ) {
    super(repoContext, appointmentRepository);
  }
}

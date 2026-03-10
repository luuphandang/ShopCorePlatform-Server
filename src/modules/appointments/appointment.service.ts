import { Injectable } from '@nestjs/common';

import { AbstractService, IServiceOptions } from '@/common/abstracts/service.abstract';
import { ServiceContext } from '@/common/contexts';
import { EAppointmentStatus } from '@/common/enums/appointment.enum';

import { AppointmentRepository } from './appointment.repository';
import { Appointment } from './entities/appointment.entity';

@Injectable()
export class AppointmentService extends AbstractService<Appointment, AppointmentRepository> {
  constructor(
    serviceContext: ServiceContext,
    private readonly appointmentRepository: AppointmentRepository,
  ) {
    super(serviceContext, appointmentRepository);
  }

  protected initializeDependencies() {}

  public async pendingAppointment(
    id: number,
    options?: IServiceOptions<Appointment>,
  ): Promise<Appointment | null> {
    return this.changeAppointmentStatus(id, EAppointmentStatus.PENDING, options);
  }

  public async confirmedAppointment(
    id: number,
    options?: IServiceOptions<Appointment>,
  ): Promise<Appointment | null> {
    return this.changeAppointmentStatus(id, EAppointmentStatus.CONFIRMED, options);
  }

  public async completedAppointment(
    id: number,
    options?: IServiceOptions<Appointment>,
  ): Promise<Appointment | null> {
    return this.changeAppointmentStatus(id, EAppointmentStatus.COMPLETED, options);
  }

  public async cancelledAppointment(
    id: number,
    options?: IServiceOptions<Appointment>,
  ): Promise<Appointment | null> {
    return this.changeAppointmentStatus(id, EAppointmentStatus.CANCELLED, options);
  }

  // Protected methods

  protected async changeAppointmentStatus(
    id: number,
    status: EAppointmentStatus,
    options?: IServiceOptions<Appointment>,
  ) {
    return this.update(id, { status }, options);
  }
}

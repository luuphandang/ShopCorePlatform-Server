import { Injectable } from '@nestjs/common';

import {
  AbstractStatusService,
  IStatusChangeOptions,
  IStatusTransitionMap,
} from '@/common/abstracts/status-service.abstract';
import { ServiceContext } from '@/common/contexts';
import { EAppointmentStatus } from '@/common/enums/appointment.enum';

import { AppointmentRepository } from './appointment.repository';
import { Appointment } from './entities/appointment.entity';

const APPOINTMENT_TRANSITIONS: IStatusTransitionMap<EAppointmentStatus> = {
  [EAppointmentStatus.PENDING]: [EAppointmentStatus.CONFIRMED, EAppointmentStatus.CANCELLED],
  [EAppointmentStatus.CONFIRMED]: [
    EAppointmentStatus.COMPLETED,
    EAppointmentStatus.CANCELLED,
    EAppointmentStatus.RESCHEDULED,
  ],
  [EAppointmentStatus.RESCHEDULED]: [
    EAppointmentStatus.CONFIRMED,
    EAppointmentStatus.CANCELLED,
  ],
};

@Injectable()
export class AppointmentService extends AbstractStatusService<
  Appointment,
  AppointmentRepository,
  EAppointmentStatus
> {
  protected readonly statusTransitions = APPOINTMENT_TRANSITIONS;

  constructor(
    serviceContext: ServiceContext,
    private readonly appointmentRepository: AppointmentRepository,
  ) {
    super(serviceContext, appointmentRepository);
  }

  protected initializeDependencies() {}

  public async pendingAppointment(
    id: number,
    options?: IStatusChangeOptions<Appointment>,
  ): Promise<Appointment | null> {
    return this.changeStatus(id, EAppointmentStatus.PENDING, options);
  }

  public async confirmedAppointment(
    id: number,
    options?: IStatusChangeOptions<Appointment>,
  ): Promise<Appointment | null> {
    return this.changeStatus(id, EAppointmentStatus.CONFIRMED, options);
  }

  public async completedAppointment(
    id: number,
    options?: IStatusChangeOptions<Appointment>,
  ): Promise<Appointment | null> {
    return this.changeStatus(id, EAppointmentStatus.COMPLETED, options);
  }

  public async cancelledAppointment(
    id: number,
    options?: IStatusChangeOptions<Appointment>,
  ): Promise<Appointment | null> {
    return this.changeStatus(id, EAppointmentStatus.CANCELLED, options);
  }
}

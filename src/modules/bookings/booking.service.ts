import { Injectable } from '@nestjs/common';

import {
  AbstractStatusService,
  IStatusChangeOptions,
  IStatusTransitionMap,
} from '@/common/abstracts/status-service.abstract';
import { ServiceContext } from '@/common/contexts';
import { EBookingStatus } from '@/common/enums/booking.enum';

import { BookingRepository } from './booking.repository';
import { Booking } from './entities/booking.entity';

const BOOKING_TRANSITIONS: IStatusTransitionMap<EBookingStatus> = {
  [EBookingStatus.PENDING]: [EBookingStatus.CONFIRMED, EBookingStatus.CANCELLED],
  [EBookingStatus.CONFIRMED]: [
    EBookingStatus.COMPLETED,
    EBookingStatus.CANCELLED,
    EBookingStatus.RESCHEDULED,
  ],
  [EBookingStatus.RESCHEDULED]: [
    EBookingStatus.CONFIRMED,
    EBookingStatus.CANCELLED,
  ],
};

@Injectable()
export class BookingService extends AbstractStatusService<
  Booking,
  BookingRepository,
  EBookingStatus
> {
  protected readonly statusTransitions = BOOKING_TRANSITIONS;

  constructor(
    serviceContext: ServiceContext,
    private readonly bookingRepository: BookingRepository,
  ) {
    super(serviceContext, bookingRepository);
  }

  protected initializeDependencies() {}

  public async pendingBooking(
    id: number,
    options?: IStatusChangeOptions<Booking>,
  ): Promise<Booking | null> {
    return this.changeStatus(id, EBookingStatus.PENDING, options);
  }

  public async confirmedBooking(
    id: number,
    options?: IStatusChangeOptions<Booking>,
  ): Promise<Booking | null> {
    return this.changeStatus(id, EBookingStatus.CONFIRMED, options);
  }

  public async completedBooking(
    id: number,
    options?: IStatusChangeOptions<Booking>,
  ): Promise<Booking | null> {
    return this.changeStatus(id, EBookingStatus.COMPLETED, options);
  }

  public async cancelledBooking(
    id: number,
    options?: IStatusChangeOptions<Booking>,
  ): Promise<Booking | null> {
    return this.changeStatus(id, EBookingStatus.CANCELLED, options);
  }
}

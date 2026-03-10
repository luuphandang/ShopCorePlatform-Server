import { Injectable } from '@nestjs/common';

import { AbstractService, IServiceOptions } from '@/common/abstracts/service.abstract';
import { ServiceContext } from '@/common/contexts';
import { EBookingStatus } from '@/common/enums/booking.enum';

import { BookingRepository } from './booking.repository';
import { Booking } from './entities/booking.entity';

@Injectable()
export class BookingService extends AbstractService<Booking, BookingRepository> {
  constructor(
    serviceContext: ServiceContext,
    private readonly bookingRepository: BookingRepository,
  ) {
    super(serviceContext, bookingRepository);
  }

  protected initializeDependencies() {}

  public async pendingBooking(
    id: number,
    options?: IServiceOptions<Booking>,
  ): Promise<Booking | null> {
    return this.changeBookingStatus(id, EBookingStatus.PENDING, options);
  }

  public async confirmedBooking(
    id: number,
    options?: IServiceOptions<Booking>,
  ): Promise<Booking | null> {
    return this.changeBookingStatus(id, EBookingStatus.CONFIRMED, options);
  }

  public async completedBooking(
    id: number,
    options?: IServiceOptions<Booking>,
  ): Promise<Booking | null> {
    return this.changeBookingStatus(id, EBookingStatus.COMPLETED, options);
  }

  public async cancelledBooking(
    id: number,
    options?: IServiceOptions<Booking>,
  ): Promise<Booking | null> {
    return this.changeBookingStatus(id, EBookingStatus.CANCELLED, options);
  }

  // Protected methods

  protected async changeBookingStatus(
    id: number,
    status: EBookingStatus,
    options?: IServiceOptions<Booking>,
  ) {
    return this.update(id, { status }, options);
  }
}

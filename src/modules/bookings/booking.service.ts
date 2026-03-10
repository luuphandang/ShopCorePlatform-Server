import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ModuleRef } from '@nestjs/core';

import { AbstractService, IServiceOptions } from '@/common/abstracts/service.abstract';
import { EnvironmentVariables } from '@/common/helpers/env.validation';
import { AppLogger } from '@/common/logger/logger.service';
import { RabbitMQService } from '@/common/rabbitmq/rabbitmq.service';
import { EBookingStatus } from '@/common/enums/booking.enum';
import { UtilService } from '@/common/utils/util.service';

import { BookingRepository } from './booking.repository';
import { Booking } from './entities/booking.entity';
import { RedisService } from '@/common/redis/redis.service';

@Injectable()
export class BookingService extends AbstractService<Booking, BookingRepository> {
  constructor(
    configService: ConfigService<EnvironmentVariables>,
    utilService: UtilService,
    appLogger: AppLogger,
    rabbitMQService: RabbitMQService,
    redisService: RedisService,
    moduleRef: ModuleRef,

    private readonly bookingRepository: BookingRepository,
  ) {
    super(configService, utilService, appLogger, rabbitMQService, redisService, moduleRef, bookingRepository);
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

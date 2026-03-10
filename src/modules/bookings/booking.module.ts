import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { BookingRepository } from './booking.repository';
import { BookingResolver } from './booking.resolver';
import { BookingService } from './booking.service';
import { BookingEventsController } from './booking-events.controller';
import { Booking } from './entities/booking.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Booking])],
  providers: [BookingEventsController, BookingResolver, BookingService, BookingRepository],
  controllers: [BookingEventsController],
  exports: [BookingService, BookingResolver],
})
export class BookingModule {}

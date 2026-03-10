import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AppointmentRepository } from './appointment.repository';
import { AppointmentResolver } from './appointment.resolver';
import { AppointmentService } from './appointment.service';
import { AppointmentEventsController } from './appointment-events.controller';
import { Appointment } from './entities/appointment.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Appointment])],
  providers: [
    AppointmentEventsController,
    AppointmentResolver,
    AppointmentService,
    AppointmentRepository,
  ],
  controllers: [AppointmentEventsController],
  exports: [AppointmentService, AppointmentResolver],
})
export class AppointmentModule {}

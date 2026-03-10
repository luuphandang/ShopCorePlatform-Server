import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ModuleRef } from '@nestjs/core';

import { AbstractService, IServiceOptions } from '@/common/abstracts/service.abstract';
import { EnvironmentVariables } from '@/common/helpers/env.validation';
import { AppLogger } from '@/common/logger/logger.service';
import { RabbitMQService } from '@/common/rabbitmq/rabbitmq.service';
import { EAppointmentStatus } from '@/common/enums/appointment.enum';
import { UtilService } from '@/common/utils/util.service';

import { AppointmentRepository } from './appointment.repository';
import { Appointment } from './entities/appointment.entity';
import { RedisService } from '@/common/redis/redis.service';

@Injectable()
export class AppointmentService extends AbstractService<Appointment, AppointmentRepository> {
  constructor(
    configService: ConfigService<EnvironmentVariables>,
    utilService: UtilService,
    appLogger: AppLogger,
    rabbitMQService: RabbitMQService,
    redisService: RedisService,
    moduleRef: ModuleRef,

    private readonly appointmentRepository: AppointmentRepository,
  ) {
    super(configService, utilService, appLogger, rabbitMQService, redisService, moduleRef, appointmentRepository);
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

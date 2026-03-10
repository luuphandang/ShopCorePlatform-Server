import { Controller } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { AbstractEvents } from '@/common/abstracts/events.abstract';
import { EnvironmentVariables } from '@/common/helpers/env.validation';
import { AppLogger } from '@/common/logger/logger.service';
import { RabbitEvent, RabbitRPC } from '@/common/rabbitmq/rabbitmq.decorator';
import { RabbitMQService } from '@/common/rabbitmq/rabbitmq.service';
import { ENTITIES, RABBITMQ_EVENTS } from '@/common/constants/event.constant';
import { UtilService } from '@/common/utils/util.service';

import { Unit } from './entities/unit.entity';

@Controller()
export class UnitEventsController extends AbstractEvents {
  constructor(
    configService: ConfigService<EnvironmentVariables>,
    utilService: UtilService,
    appLogger: AppLogger,

    rabbitMQService: RabbitMQService,
  ) {
    super(configService, utilService, appLogger, rabbitMQService);
  }

  @RabbitEvent({
    exchange: ENTITIES.unit,
    queue: RABBITMQ_EVENTS.publish.unit.create,
    routingKey: RABBITMQ_EVENTS.publish.unit.create,
    type: 'direct',
  })
  unitCreatedPublish(message: Unit): IRabitMQResponse<Unit> {
    this.logger.log(
      `Unit created: ${JSON.stringify(message)}`,
      `${this.className}:unitCreatedPublish`,
    );
    console.log(message);

    return {
      success: true,
      message: 'Unit created successfully',
      data: message,
    };
  }

  @RabbitRPC({
    exchange: ENTITIES.unit,
    queue: RABBITMQ_EVENTS.request.unit.create,
    routingKey: RABBITMQ_EVENTS.request.unit.create,
    type: 'direct',
  })
  unitCreatedRequest(message: Unit): IRabitMQResponse<Unit> {
    this.logger.log(
      `Unit created: ${JSON.stringify(message)}`,
      `${this.className}:unitCreatedRequest`,
    );
    console.log(message);

    return {
      success: true,
      message: 'Unit created successfully',
      data: message,
    };
  }
}

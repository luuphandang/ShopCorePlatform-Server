import { Controller } from '@nestjs/common';

import { AbstractEvents } from '@/common/abstracts/events.abstract';
import { EventContext } from '@/common/contexts';
import { RabbitEvent, RabbitRPC } from '@/common/rabbitmq/rabbitmq.decorator';
import { ENTITIES, RABBITMQ_EVENTS } from '@/common/constants/event.constant';

import { Unit } from './entities/unit.entity';

@Controller()
export class UnitEventsController extends AbstractEvents {
  constructor(eventContext: EventContext) {
    super(eventContext);
  }

  @RabbitEvent({
    exchange: ENTITIES.unit,
    queue: RABBITMQ_EVENTS.publish.unit.create,
    routingKey: RABBITMQ_EVENTS.publish.unit.create,
    type: 'direct',
  })
  unitCreatedPublish(message: Unit): IRabbitMQResponse<Unit> {
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
  unitCreatedRequest(message: Unit): IRabbitMQResponse<Unit> {
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

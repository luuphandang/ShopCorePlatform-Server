import { Controller } from '@nestjs/common';

import { AbstractEvents } from '@/common/abstracts/events.abstract';
import { EventContext } from '@/common/contexts';
import { RabbitEvent, RabbitRPC } from '@/common/rabbitmq/rabbitmq.decorator';
import { ENTITIES, RABBITMQ_EVENTS } from '@/common/constants/event.constant';

import { Product } from './entities/product.entity';

@Controller()
export class ProductEventsController extends AbstractEvents {
  constructor(eventContext: EventContext) {
    super(eventContext);
  }

  @RabbitEvent({
    exchange: ENTITIES.product,
    queue: RABBITMQ_EVENTS.publish.product.create,
    routingKey: RABBITMQ_EVENTS.publish.product.create,
    type: 'direct',
  })
  productCreatedPublish(message: Product): IRabbitMQResponse<Product> {
    this.logger.log(
      `Product created: ${JSON.stringify(message)}`,
      `${this.className}:productCreatedPublish`,
    );
    console.log(message);

    return {
      success: true,
      message: 'Product created successfully',
      data: message,
    };
  }

  @RabbitRPC({
    exchange: ENTITIES.product,
    queue: RABBITMQ_EVENTS.request.product.create,
    routingKey: RABBITMQ_EVENTS.request.product.create,
    type: 'direct',
  })
  productCreatedRequest(message: Product): IRabbitMQResponse<Product> {
    this.logger.log(
      `Product created: ${JSON.stringify(message)}`,
      `${this.className}:productCreatedRequest`,
    );
    console.log(message);

    return {
      success: true,
      message: 'Product created successfully',
      data: message,
    };
  }
}

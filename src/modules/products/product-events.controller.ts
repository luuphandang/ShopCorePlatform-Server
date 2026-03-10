import { Controller } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { AbstractEvents } from '@/common/abstracts/events.abstract';
import { EnvironmentVariables } from '@/common/helpers/env.validation';
import { AppLogger } from '@/common/logger/logger.service';
import { RabbitEvent, RabbitRPC } from '@/common/rabbitmq/rabbitmq.decorator';
import { RabbitMQService } from '@/common/rabbitmq/rabbitmq.service';
import { ENTITIES, RABBITMQ_EVENTS } from '@/common/constants/event.constant';
import { UtilService } from '@/common/utils/util.service';

import { Product } from './entities/product.entity';

@Controller()
export class ProductEventsController extends AbstractEvents {
  constructor(
    configService: ConfigService<EnvironmentVariables>,
    utilService: UtilService,
    appLogger: AppLogger,

    rabbitMQService: RabbitMQService,
  ) {
    super(configService, utilService, appLogger, rabbitMQService);
  }

  @RabbitEvent({
    exchange: ENTITIES.product,
    queue: RABBITMQ_EVENTS.publish.product.create,
    routingKey: RABBITMQ_EVENTS.publish.product.create,
    type: 'direct',
  })
  productCreatedPublish(message: Product): IRabitMQResponse<Product> {
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
  productCreatedRequest(message: Product): IRabitMQResponse<Product> {
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

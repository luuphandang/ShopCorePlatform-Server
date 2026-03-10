import { Controller } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { AbstractEvents } from '@/common/abstracts/events.abstract';
import { EnvironmentVariables } from '@/common/helpers/env.validation';
import { AppLogger } from '@/common/logger/logger.service';
import { RabbitMQService } from '@/common/rabbitmq/rabbitmq.service';
import { UtilService } from '@/common/utils/util.service';

@Controller()
export class ProductAttributeEventsController extends AbstractEvents {
  constructor(
    configService: ConfigService<EnvironmentVariables>,
    utilService: UtilService,
    appLogger: AppLogger,

    rabbitMQService: RabbitMQService,
  ) {
    super(configService, utilService, appLogger, rabbitMQService);
  }
}

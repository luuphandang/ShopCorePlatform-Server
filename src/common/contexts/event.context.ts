import { Injectable } from '@nestjs/common';

import { RabbitMQService } from '../rabbitmq/rabbitmq.service';
import { CoreContext } from './core.context';

@Injectable()
export class EventContext {
  constructor(
    readonly core: CoreContext,
    readonly rabbitMQService: RabbitMQService,
  ) {}
}

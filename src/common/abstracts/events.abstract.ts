import { ConfigService } from '@nestjs/config';

import { EnvironmentVariables } from '../helpers/env.validation';
import { AppLogger } from '../logger/logger.service';
import { RabbitMQService } from '../rabbitmq/rabbitmq.service';
import { RABBITMQ_EVENTS } from '../constants/event.constant';
import { UtilService } from '../utils/util.service';
import { AbstractBase } from './base.abstract';

export abstract class AbstractEvents extends AbstractBase {
  constructor(
    configService: ConfigService<EnvironmentVariables>,
    utilService: UtilService,
    appLogger: AppLogger,

    private readonly _rabbitMQService: RabbitMQService,
  ) {
    super(configService, utilService, appLogger);
  }

  // Protected methods

  protected get rabbitMQ() {
    return {
      publish: this.publishRabbitMQEvent.bind(this),
      request: this.requestRabbitMQRPC.bind(this),
    };
  }

  // Private methods

  private get rabbitMQService(): RabbitMQService {
    return this._rabbitMQService;
  }

  private async publishRabbitMQEvent(
    action: string,
    data: unknown,
    type: 'direct' | 'topic' | 'fanout' = 'direct',
  ): Promise<boolean> {
    try {
      const entity = this.util.getEntity(this.className);
      const routingKey = RABBITMQ_EVENTS.publish[entity]?.[action];

      return await this.rabbitMQService.publish(entity, routingKey, data, type);
    } catch (error) {
      this.logger.error(error, `${this.className}:publishRabbitMQEvent`);
    }

    return false;
  }

  private async requestRabbitMQRPC<T>(
    action: string,
    data: unknown,
    type: 'direct' | 'topic' | 'fanout' = 'direct',
  ): Promise<T | null> {
    try {
      const entity = this.util.getEntity(this.className);
      const routingKey = RABBITMQ_EVENTS.request[entity]?.[action];

      const result = await this.rabbitMQService.request<IRabitMQResponse<T>>(
        entity,
        routingKey,
        data,
        type,
      );
      if (!result.success) throw new Error(result.message || 'Lỗi khi gửi sự kiện');

      return result.data;
    } catch (error) {
      this.logger.error(error, `${this.className}:requestRabbitMQRPC`);
    }

    return null;
  }
}

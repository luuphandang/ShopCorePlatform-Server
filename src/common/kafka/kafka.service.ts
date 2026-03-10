import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ClientKafka } from '@nestjs/microservices';

import { AbstractBase } from '../abstracts/base.abstract';
import { EnvironmentVariables } from '../helpers/env.validation';
import { AppLogger } from '../logger/logger.service';
import { EVENT_TOPICS } from '../constants/event.constant';
import { UtilService } from '../utils/util.service';

@Injectable()
export class KafkaService extends AbstractBase implements OnModuleInit {
  constructor(
    configService: ConfigService<EnvironmentVariables>,
    utilService: UtilService,
    appLogger: AppLogger,

    @Inject('KAFKA_CLIENT') private readonly client: ClientKafka,
  ) {
    super(configService, utilService, appLogger);
  }

  public async onModuleInit() {
    try {
      await this.retry(() => this.client.connect());
      this.logger.log('✅ Kafka client connected successfully');

      this.subscribeAllTopics(EVENT_TOPICS);
      this.logger.log('✅ Kafka topics subscribed successfully');
    } catch (error) {
      this.logger.error('❌ Kafka client connected failed:', error);
      throw error;
    }
  }

  async onModuleDestroy() {
    await this.client.close();
    this.logger.log('✅ Kafka client disconnected');
  }

  public async publish<T>(topic: string, message: T) {
    return new Promise((resolve, reject) => {
      this.emit(topic, JSON.stringify(message)).subscribe({
        next: (res) => resolve(res),
        error: (err) => {
          this.logger.error(`❌ Kafka publish error for topic ${topic}:`, err);
          reject(err);
        },
      });
    });
  }

  public async request<T>(topic: string, message: T) {
    return new Promise((resolve, reject) => {
      this.send(topic, message).subscribe({
        next: (res) => resolve(res),
        error: (err) => {
          this.logger.error(`❌ Kafka request error for topic ${topic}:`, err);
          reject(err);
        },
      });
    });
  }

  // Private methods

  private subscribeAllTopics(topics: Record<string, unknown>) {
    for (const key in topics) {
      if (typeof topics[key] === 'string') {
        this.client.subscribeToResponseOf(topics[key] as string);
      } else if (topics[key] && typeof topics[key] === 'object' && !Array.isArray(topics[key])) {
        this.subscribeAllTopics(topics[key] as Record<string, unknown>);
      }
    }
  }

  private send<T, R>(topic: string, message: T) {
    return this.client.send<R, T>(topic, message);
  }

  private emit<T>(topic: string, message: T) {
    return this.client.emit(topic, message);
  }
}

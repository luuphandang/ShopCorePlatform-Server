import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ModuleRef } from '@nestjs/core';

import { AbstractService, IServiceOptions } from '@/common/abstracts/service.abstract';
import { EnvironmentVariables } from '@/common/helpers/env.validation';
import { AppLogger } from '@/common/logger/logger.service';
import { RabbitMQService } from '@/common/rabbitmq/rabbitmq.service';
import { UtilService } from '@/common/utils/util.service';

import { ConversionUnitRepository } from './conversion-unit.repository';
import { ConversionUnit } from './entities/conversion-unit.entity';
import { CreateConversionUnitInput } from './inputs/create-conversion-unit.input';
import { UpdateConversionUnitInput } from './inputs/update-conversion-unit.input';
import { RedisService } from '@/common/redis/redis.service';

@Injectable()
export class ConversionUnitService extends AbstractService<
  ConversionUnit,
  ConversionUnitRepository
> {
  constructor(
    configService: ConfigService<EnvironmentVariables>,
    utilService: UtilService,
    appLogger: AppLogger,
    rabbitMQService: RabbitMQService,
    redisService: RedisService,
    moduleRef: ModuleRef,

    private readonly conversionUnitRepository: ConversionUnitRepository,
  ) {
    super(
      configService,
      utilService,
      appLogger,
      rabbitMQService,
      redisService,
      moduleRef,
      conversionUnitRepository,
    );
  }

  protected initializeDependencies() {}

  public async createConversionUnit(
    data: CreateConversionUnitInput,
    options: IServiceOptions<ConversionUnit> = {},
  ): Promise<ConversionUnit> {
    try {
      return await this.executeInTransaction(async () => {
        return await this.create(
          { ...data, ...(data?.unit && { unit_id: data.unit?.id }) },
          options,
        );
      });
    } catch (error) {
      this.logger.error(error, `${this.className}:createConversionUnit`);
      throw error;
    }
  }
  public async updateConversionUnit(
    id: number,
    data: UpdateConversionUnitInput,
    options: IServiceOptions<ConversionUnit> = {},
  ): Promise<ConversionUnit> {
    try {
      return await this.executeInTransaction(async () => {
        return await this.update(
          id,
          { ...data, ...(data?.unit && { unit_id: data.unit?.id }) },
          options,
        );
      });
    } catch (error) {
      this.logger.error(error, `${this.className}:updateConversionUnit`);
      throw error;
    }
  }
}

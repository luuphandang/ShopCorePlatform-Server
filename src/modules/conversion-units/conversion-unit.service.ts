import { Injectable } from '@nestjs/common';

import { AbstractService, IServiceOptions } from '@/common/abstracts/service.abstract';
import { ServiceContext } from '@/common/contexts';

import { ConversionUnitRepository } from './conversion-unit.repository';
import { ConversionUnit } from './entities/conversion-unit.entity';
import { CreateConversionUnitInput } from './inputs/create-conversion-unit.input';
import { UpdateConversionUnitInput } from './inputs/update-conversion-unit.input';

@Injectable()
export class ConversionUnitService extends AbstractService<
  ConversionUnit,
  ConversionUnitRepository
> {
  constructor(
    serviceContext: ServiceContext,
    private readonly conversionUnitRepository: ConversionUnitRepository,
  ) {
    super(serviceContext, conversionUnitRepository);
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

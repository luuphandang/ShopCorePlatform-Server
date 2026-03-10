import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ModuleRef } from '@nestjs/core';

import { AbstractService, IServiceOptions } from '@/common/abstracts/service.abstract';
import { CustomNotFoundError } from '@/common/exceptions/not-found.exception';
import { EnvironmentVariables } from '@/common/helpers/env.validation';
import { AppLogger } from '@/common/logger/logger.service';
import { RabbitMQService } from '@/common/rabbitmq/rabbitmq.service';
import { UtilService } from '@/common/utils/util.service';

import { FileUploadService } from '../file-uploads/file-upload.service';
import { ProductAttributeService } from '../product-attributes/product-attribute.service';
import { ProductVariant } from './entities/product-variant.entity';
import { CreateProductVariantInput } from './inputs/create-product-variant.input';
import { UpdateProductVariantInput } from './inputs/update-product-variant.input';
import { ProductVariantRepository } from './product-variant.repository';
import { RedisService } from '@/common/redis/redis.service';

@Injectable()
export class ProductVariantService extends AbstractService<
  ProductVariant,
  ProductVariantRepository
> {
  private productAttributeService: ProductAttributeService;
  private fileUploadService: FileUploadService;

  constructor(
    configService: ConfigService<EnvironmentVariables>,
    utilService: UtilService,
    appLogger: AppLogger,
    rabbitMQService: RabbitMQService,
    redisService: RedisService,
    moduleRef: ModuleRef,

    private readonly productVariantRepository: ProductVariantRepository,
  ) {
    super(
      configService,
      utilService,
      appLogger,
      rabbitMQService,
      redisService,
      moduleRef,
      productVariantRepository,
    );
  }

  protected initializeDependencies() {
    this.productAttributeService = this.moduleRef.get(ProductAttributeService, { strict: false });
    this.fileUploadService = this.moduleRef.get(FileUploadService, { strict: false });
  }

  async createProductVariant(
    data: CreateProductVariantInput,
    options?: IServiceOptions<ProductVariant>,
  ): Promise<ProductVariant> {
    try {
      return await this.executeInTransaction(async () => {
        return await this.create(
          {
            ...data,
            gallery_image_ids: data.gallery_images?.map((elm) => elm.id),
            attribute_ids: data.attributes?.map((elm) => elm.id),
            attribute_value_ids: data.values?.map((elm) => elm.id),
          },
          options,
        );
      });
    } catch (error) {
      this.logger.error(error, `${this.className}:createProductVariant`);
      throw error;
    }
  }

  async updateProductVariant(
    id: number,
    data: UpdateProductVariantInput,
    options?: IServiceOptions<ProductVariant>,
  ): Promise<ProductVariant | null> {
    try {
      return await this.executeInTransaction(async () => {
        if (!options.model) {
          options.model = await this.productVariantRepository.getOne({
            where: { id },
            relations: { attributes: true },
          });
        }
        if (!options.model || options.model.id !== id)
          throw new CustomNotFoundError('Không tìm thấy dữ liệu.');

        Object.assign(options.model, data, {
          ...(Array.isArray(data.gallery_images) && {
            gallery_image_ids: data.gallery_images.map((elm) => elm.id),
          }),
          ...(Array.isArray(data.conversion_units) && {
            conversion_unit_ids: data.conversion_units.map((elm) => elm.id),
          }),
          ...(Array.isArray(data.attributes) && {
            attribute_ids: data.attributes.map((elm) => elm.id),
            attributes: data.attributes,
          }),
          ...(Array.isArray(data.values) && {
            attribute_value_ids: data.values.map((elm) => elm.id),
          }),
        });

        return await this.update(id, options.model, options);
      });
    } catch (error) {
      this.logger.error(error, `${this.className}:updateProductVariant`);
      throw error;
    }
  }
}

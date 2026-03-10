import { Injectable } from '@nestjs/common';

import { AbstractService, IServiceOptions } from '@/common/abstracts/service.abstract';
import { CustomNotFoundError } from '@/common/exceptions/not-found.exception';
import { ServiceContext } from '@/common/contexts';

import { CategoryService } from '../categories/category.service';
import { ConversionUnitService } from '../conversion-units/conversion-unit.service';
import { FileUploadService } from '../file-uploads/file-upload.service';
import { ProductAttributeService } from '../product-attributes/product-attribute.service';
import { ProductVariantService } from '../product-variants/product-variant.service';
import { UnitService } from '../units/unit.service';
import { Product } from './entities/product.entity';
import { CreateProductInput } from './inputs/create-product.input';
import { UpdateProductInput } from './inputs/update-product.input';
import { ProductRepository } from './product.repository';

@Injectable()
export class ProductService extends AbstractService<Product, ProductRepository> {
  private fileUploadService: FileUploadService;
  private productAttributeService: ProductAttributeService;
  private categoryService: CategoryService;
  private productVariantService: ProductVariantService;
  private conversionUnitService: ConversionUnitService;
  private unitService: UnitService;

  constructor(
    serviceContext: ServiceContext,
    private readonly productRepository: ProductRepository,
  ) {
    super(serviceContext, productRepository);
  }

  protected initializeDependencies() {
    this.fileUploadService = this.moduleRef.get(FileUploadService, { strict: false });
    this.categoryService = this.moduleRef.get(CategoryService, { strict: false });
    this.conversionUnitService = this.moduleRef.get(ConversionUnitService, { strict: false });
    this.unitService = this.moduleRef.get(UnitService, { strict: false });
    this.productAttributeService = this.moduleRef.get(ProductAttributeService, { strict: false });
    this.productVariantService = this.moduleRef.get(ProductVariantService, { strict: false });
  }

  async createProduct(
    data: CreateProductInput,
    options?: IServiceOptions<Product>,
  ): Promise<Product> {
    try {
      return await this.executeInTransaction(async () => {
        const normalizedData = await this.normalizationCreateProduct(data);

        const newProduct = await this.create(normalizedData, { ...options, skipPublish: true });

        const baseUnit = newProduct.conversion_units.sort(
          (a, b) => a.conversion_rate - b.conversion_rate,
        )[0];
        newProduct.base_unit_id = baseUnit.id;

        for (const variant of newProduct.variants) {
          const baseUnit = variant.conversion_units.sort(
            (a, b) => a.conversion_rate - b.conversion_rate,
          )[0];
          variant.base_unit_id = baseUnit.id;
        }

        return await this.update(newProduct.id, newProduct, { model: newProduct });
      });
    } catch (error) {
      this.logger.error(error, `${this.className}:createProduct`);
      throw error;
    }
  }

  async updateProduct(
    id: number,
    data: UpdateProductInput,
    options?: IServiceOptions<Product>,
  ): Promise<Product | null> {
    try {
      return await this.executeInTransaction(async () => {
        if (!options.model) {
          options.model = await this.productRepository.getOne({
            where: { id },
            relations: {
              categories: true,
              attributes: true,
              variants: true,
            },
          });
        }
        if (!options.model || options.model.id !== id)
          throw new CustomNotFoundError('Không tìm thấy dữ liệu.');

        const normalizedData = await this.normalizeUpdateProduct(data);

        Object.assign(options.model, normalizedData);

        const newProduct = await this.update(id, options.model, { ...options, skipPublish: true });

        const baseUnit = newProduct.conversion_units.sort(
          (a, b) => a.conversion_rate - b.conversion_rate,
        )[0];
        newProduct.base_unit_id = baseUnit.id;

        for (const variant of newProduct.variants) {
          const baseUnit = variant.conversion_units.sort(
            (a, b) => a.conversion_rate - b.conversion_rate,
          )[0];
          variant.base_unit_id = baseUnit.id;
        }

        return await this.update(newProduct.id, newProduct, { model: newProduct });
      });
    } catch (error) {
      this.logger.error(error, `${this.className}:updateProduct`);
      throw error;
    }
  }

  private async normalizationCreateProduct(data: CreateProductInput): Promise<CreateProductInput> {
    const { categories, thumbnail, gallery_images, attachments, attributes, values } = data;

    Object.assign(data, {
      category_ids: categories?.filter((c) => c?.id).map((c) => c.id),
      thumbnail_id: thumbnail?.id,
      gallery_image_ids: gallery_images?.filter((g) => g?.id).map((g) => g.id),
      attachment_ids: attachments?.filter((a) => a?.id).map((a) => a.id),
      attribute_ids: attributes?.filter((a) => a?.id).map((a) => a.id),
      attribute_value_ids: values?.filter((v) => v?.id).map((v) => v.id),
    });

    return data;
  }

  private async normalizeUpdateProduct(data: UpdateProductInput): Promise<UpdateProductInput> {
    const { categories, thumbnail, gallery_images, attachments, attributes, values } = data;

    Object.assign(data, {
      category_ids: categories?.filter((c) => c?.id).map((c) => c.id),
      thumbnail_id: thumbnail?.id,
      gallery_image_ids: gallery_images?.filter((g) => g?.id).map((g) => g.id),
      attachment_ids: attachments?.filter((a) => a?.id).map((a) => a.id),
      attribute_ids: attributes?.filter((a) => a?.id).map((a) => a.id),
      attribute_value_ids: values?.filter((v) => v?.id).map((v) => v.id),
    });

    return data;
  }
}

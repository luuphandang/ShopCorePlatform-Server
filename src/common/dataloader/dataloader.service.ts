import { Injectable } from '@nestjs/common';
import DataLoader from 'dataloader';

import { AddressService } from '@/modules/addresses/address.service';
import { AppointmentService } from '@/modules/appointments/appointment.service';
import { BlogService } from '@/modules/blogs/blog.service';
import { CategoryService } from '@/modules/categories/category.service';
import { ConversionUnitService } from '@/modules/conversion-units/conversion-unit.service';
import { FileUploadService } from '@/modules/file-uploads/file-upload.service';
import { OrderDetailService } from '@/modules/order-details/order-detail.service';
import { OrderHistoryService } from '@/modules/order-histories/order-history.service';
import { OrderShippingService } from '@/modules/order-shippings/order-shipping.service';
import { OrderService } from '@/modules/orders/order.service';
import { PermissionService } from '@/modules/permissions/permission.service';
import { ProductAttributeValueService } from '@/modules/product-attribute-values/product-attribute-value.service';
import { ProductAttributeService } from '@/modules/product-attributes/product-attribute.service';
import { ProductReviewService } from '@/modules/product-reviews/product-review.service';
import { ProductVariantService } from '@/modules/product-variants/product-variant.service';
import { ProductService } from '@/modules/products/product.service';
import { RoleService } from '@/modules/roles/role.service';
import { UnitService } from '@/modules/units/unit.service';
import { UserService } from '@/modules/users/user.service';

import { IDataloader } from './dataloader.interface';

@Injectable()
export class DataloaderService {
  constructor(
    private readonly addressService: AddressService,
    private readonly appointmentsService: AppointmentService,
    private readonly blogService: BlogService,
    private readonly categoryService: CategoryService,
    private readonly conversionUnitService: ConversionUnitService,
    private readonly fileUploadService: FileUploadService,
    private readonly orderHistoryService: OrderHistoryService,
    private readonly orderShippingService: OrderShippingService,
    private readonly orderDetailService: OrderDetailService,
    private readonly orderService: OrderService,
    private readonly permissionService: PermissionService,
    private readonly productAttributeValueService: ProductAttributeValueService,
    private readonly productAttributeService: ProductAttributeService,
    private readonly productService: ProductService,
    private readonly productVariantService: ProductVariantService,
    private readonly roleService: RoleService,
    private readonly userService: UserService,
    private readonly unitService: UnitService,
    private readonly productReviewService: ProductReviewService,
  ) {}

  private createLoader<T extends { id: number }>(
    batchFn: (ids: number[]) => Promise<T[]>,
  ): DataLoader<number[], Map<number, T>> {
    return new DataLoader<number[], Map<number, T>>(async (keys) => {
      const results = await batchFn(keys.flat());
      const resultMap = new Map(results.map((item) => [item.id, item]));

      return keys.map(() => resultMap);
    });
  }

  private createRelatedLoader<T extends { id: number }>(
    batchFn: (ids: number[]) => Promise<T[]>,
    relatedKey: keyof T,
  ): DataLoader<number[], Map<number, T[]>> {
    return new DataLoader<number[], Map<number, T[]>>(async (keys) => {
      const results = await batchFn(keys.flat());
      const resultMap = new Map<number, T[]>();

      results.forEach((item) => {
        const key = item[relatedKey] as number;
        if (!resultMap.has(key)) {
          resultMap.set(key, []);
        }

        resultMap.get(key)?.push(item);
      });

      return keys.map(() => resultMap);
    });
  }

  createLoaders(): IDataloader {
    return {
      addresses: this.createLoader((ids) => this.addressService.getByIds(ids)),

      appointments: this.createLoader((ids) => this.appointmentsService.getByIds(ids)),

      productAttributeValues: this.createLoader((ids) =>
        this.productAttributeValueService.getByIds(ids),
      ),

      productAttributes: this.createLoader((ids) => this.productAttributeService.getByIds(ids)),

      blogs: this.createLoader((ids) => this.blogService.getByIds(ids)),

      categories: this.createLoader((ids) => this.categoryService.getByIds(ids)),

      conversionUnits: this.createLoader((ids) => this.conversionUnitService.getByIds(ids)),

      fileUploads: this.createLoader((ids) => this.fileUploadService.getByIds(ids)),

      orderShippings: this.createLoader((ids) => this.orderShippingService.getByIds(ids)),

      orderHistories: this.createLoader((ids) => this.orderHistoryService.getByIds(ids)),

      orderDetails: this.createLoader((ids) => this.orderDetailService.getByIds(ids)),

      orders: this.createLoader((ids) => this.orderService.getByIds(ids)),

      permissions: this.createLoader((ids) => this.permissionService.getByIds(ids)),

      products: this.createLoader((ids) => this.productService.getByIds(ids)),

      roles: this.createLoader((ids) => this.roleService.getByIds(ids)),

      users: this.createLoader((ids) => this.userService.getByIds(ids)),

      productVariants: this.createLoader((ids) => this.productVariantService.getByIds(ids)),

      units: this.createLoader((ids) => this.unitService.getByIds(ids)),

      // Related loaders

      productRelated: {
        conversionUnits: this.createRelatedLoader(
          (ids) => this.conversionUnitService.getMany({ where: { product_id: { $in: ids } } }),
          'product_id',
        ),
        variants: this.createRelatedLoader(
          (ids) => this.productVariantService.getMany({ where: { product_id: { $in: ids } } }),
          'product_id',
        ),
        reviews: this.createRelatedLoader(
          (ids) => this.productReviewService.getMany({ where: { product_id: { $in: ids } } }),
          'product_id',
        ),
      },
      productAttributeRelated: {
        values: this.createRelatedLoader(
          (ids) =>
            this.productAttributeValueService.getMany({ where: { attribute_id: { $in: ids } } }),
          'attribute_id',
        ),
      },
      productVariantRelated: {
        conversionUnits: this.createRelatedLoader(
          (ids) => this.conversionUnitService.getMany({ where: { variant_id: { $in: ids } } }),
          'variant_id',
        ),
      },

      orderRelated: {
        details: this.createRelatedLoader(
          (ids) => this.orderDetailService.getMany({ where: { order_id: { $in: ids } } }),
          'order_id',
        ),
        histories: this.createRelatedLoader(
          (ids) => this.orderHistoryService.getMany({ where: { order_id: { $in: ids } } }),
          'order_id',
        ),
      },

      orderDetailRelated: {
        shippings: this.createRelatedLoader(
          (ids) => this.orderShippingService.getMany({ where: { order_detail_id: { $in: ids } } }),
          'order_detail_id',
        ),
      },
    };
  }
}

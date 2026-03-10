import { Global, Module } from '@nestjs/common';

import { AddressModule } from '@/modules/addresses/address.module';
import { AppointmentModule } from '@/modules/appointments/appointment.module';
import { BlogModule } from '@/modules/blogs/blog.module';
import { CategoryModule } from '@/modules/categories/category.module';
import { ConversionUnitModule } from '@/modules/conversion-units/conversion-unit.module';
import { FileUploadModule } from '@/modules/file-uploads/file-upload.module';
import { OrderDetailModule } from '@/modules/order-details/order-detail.module';
import { OrderHistoryModule } from '@/modules/order-histories/order-history.module';
import { OrderShippingModule } from '@/modules/order-shippings/order-shipping.module';
import { OrderModule } from '@/modules/orders/order.module';
import { PermissionModule } from '@/modules/permissions/permission.module';
import { ProductAttributeValueModule } from '@/modules/product-attribute-values/product-attribute-value.module';
import { ProductAttributeModule } from '@/modules/product-attributes/product-attribute.module';
import { ProductReviewModule } from '@/modules/product-reviews/product-review.module';
import { ProductVariantModule } from '@/modules/product-variants/product-variant.module';
import { ProductModule } from '@/modules/products/product.module';
import { RoleModule } from '@/modules/roles/role.module';
import { UnitModule } from '@/modules/units/unit.module';
import { UserModule } from '@/modules/users/user.module';

import { DataloaderService } from './dataloader.service';

@Global()
@Module({
  imports: [
    AddressModule,
    AppointmentModule,
    BlogModule,
    CategoryModule,
    ConversionUnitModule,
    FileUploadModule,
    OrderHistoryModule,
    OrderShippingModule,
    OrderDetailModule,
    OrderModule,
    PermissionModule,
    ProductAttributeValueModule,
    ProductAttributeModule,
    ProductVariantModule,
    ProductReviewModule,
    ProductModule,
    RoleModule,
    UserModule,
    UnitModule,
  ],
  providers: [DataloaderService],
  exports: [DataloaderService],
})
export class DataloaderModule {}

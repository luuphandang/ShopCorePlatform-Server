import DataLoader from 'dataloader';

import { Address } from '@/modules/addresses/entities/address.entity';
import { Appointment } from '@/modules/appointments/entities/appointment.entity';
import { Blog } from '@/modules/blogs/entities/blog.entity';
import { Category } from '@/modules/categories/entities/category.entity';
import { ConversionUnit } from '@/modules/conversion-units/entities/conversion-unit.entity';
import { FileUpload } from '@/modules/file-uploads/entities/file-upload.entity';
import { OrderDetail } from '@/modules/order-details/entities/order-detail.entity';
import { OrderHistory } from '@/modules/order-histories/entities/order-history.entity';
import { OrderShipping } from '@/modules/order-shippings/entities/order-shipping.entity';
import { Order } from '@/modules/orders/entities/order.entity';
import { Permission } from '@/modules/permissions/entities/permission.entity';
import { ProductAttributeValue } from '@/modules/product-attribute-values/entities/product-attribute-value.entity';
import { ProductAttribute } from '@/modules/product-attributes/entities/product-attribute.entity';
import { ProductReview } from '@/modules/product-reviews/entities/product-review.entity';
import { ProductVariant } from '@/modules/product-variants/entities/product-variant.entity';
import { Product } from '@/modules/products/entities/product.entity';
import { Role } from '@/modules/roles/entities/role.entity';
import { Unit } from '@/modules/units/entities/unit.entity';
import { User } from '@/modules/users/entities/user.entity';

export interface IDataloader {
  addresses: DataLoader<number[], Map<number, Address>>;
  appointments: DataLoader<number[], Map<number, Appointment>>;
  blogs: DataLoader<number[], Map<number, Blog>>;
  categories: DataLoader<number[], Map<number, Category>>;
  conversionUnits: DataLoader<number[], Map<number, ConversionUnit>>;
  fileUploads: DataLoader<number[], Map<number, FileUpload>>;
  orderDetails: DataLoader<number[], Map<number, OrderDetail>>;
  orderHistories: DataLoader<number[], Map<number, OrderHistory>>;
  orderShippings: DataLoader<number[], Map<number, OrderShipping>>;
  orders: DataLoader<number[], Map<number, Order>>;
  permissions: DataLoader<number[], Map<number, Permission>>;
  productAttributes: DataLoader<number[], Map<number, ProductAttribute>>;
  productAttributeValues: DataLoader<number[], Map<number, ProductAttributeValue>>;
  productVariants: DataLoader<number[], Map<number, ProductVariant>>;
  products: DataLoader<number[], Map<number, Product>>;
  roles: DataLoader<number[], Map<number, Role>>;
  users: DataLoader<number[], Map<number, User>>;
  units: DataLoader<number[], Map<number, Unit>>;

  // Related loaders

  productRelated: {
    conversionUnits: DataLoader<number[], Map<number, ConversionUnit[]>>;
    variants: DataLoader<number[], Map<number, ProductVariant[]>>;
    reviews: DataLoader<number[], Map<number, ProductReview[]>>;
  };
  productAttributeRelated: {
    values: DataLoader<number[], Map<number, ProductAttributeValue[]>>;
  };
  productVariantRelated: {
    conversionUnits: DataLoader<number[], Map<number, ConversionUnit[]>>;
  };

  orderRelated: {
    details: DataLoader<number[], Map<number, OrderDetail[]>>;
    histories: DataLoader<number[], Map<number, OrderHistory[]>>;
  };
  orderDetailRelated: {
    shippings: DataLoader<number[], Map<number, OrderShipping[]>>;
  };
}

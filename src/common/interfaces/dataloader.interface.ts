import DataLoader from 'dataloader';

import { Appointment } from '@/modules/appointments/entities/appointment.entity';
import { Blog } from '@/modules/blogs/entities/blog.entity';
import { Category } from '@/modules/categories/entities/category.entity';
import { ConversionUnit } from '@/modules/conversion-units/entities/conversion-unit.entity';
import { FileUpload } from '@/modules/file-uploads/entities/file-upload.entity';
import { OrderDetail } from '@/modules/order-details/entities/order-detail.entity';
import { Order } from '@/modules/orders/entities/order.entity';
import { Permission } from '@/modules/permissions/entities/permission.entity';
import { ProductAttribute } from '@/modules/product-attributes/entities/product-attribute.entity';
import { ProductVariant } from '@/modules/product-variants/entities/product-variant.entity';
import { Product } from '@/modules/products/entities/product.entity';
import { Role } from '@/modules/roles/entities/role.entity';
import { Unit } from '@/modules/units/entities/unit.entity';
import { User } from '@/modules/users/entities/user.entity';

export interface IDataloader {
  appointments: DataLoader<number[], Map<number, Appointment>>;
  productAttributes: DataLoader<number[], Map<number, ProductAttribute>>;
  blogs: DataLoader<number[], Map<number, Blog>>;
  categories: DataLoader<number[], Map<number, Category>>;
  conversionUnits: DataLoader<number[], Map<number, ConversionUnit>>;
  fileUploads: DataLoader<number[], Map<number, FileUpload>>;
  orderDetails: DataLoader<number[], Map<number, OrderDetail>>;
  orders: DataLoader<number[], Map<number, Order>>;
  permissions: DataLoader<number[], Map<number, Permission>>;
  products: DataLoader<number[], Map<number, Product>>;
  roles: DataLoader<number[], Map<number, Role>>;
  users: DataLoader<number[], Map<number, User>>;
  productVariants: DataLoader<number[], Map<number, ProductVariant>>;
  units: DataLoader<number[], Map<number, Unit>>;
}

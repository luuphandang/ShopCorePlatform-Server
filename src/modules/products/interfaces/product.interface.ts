import { Category } from '@/modules/categories/entities/category.entity';
import { ConversionUnit } from '@/modules/conversion-units/entities/conversion-unit.entity';
import { FileUpload } from '@/modules/file-uploads/entities/file-upload.entity';
import { ProductAttribute } from '@/modules/product-attributes/entities/product-attribute.entity';
import { ProductVariant } from '@/modules/product-variants/entities/product-variant.entity';

export interface IProductNestedData {
  thumbnail?: FileUpload;
  galleryImages?: FileUpload[];
  attachments?: FileUpload[];
  categories?: Category[];
  baseUnit?: ConversionUnit;
  conversionUnits?: ConversionUnit[];
  attributes?: ProductAttribute[];
  variants?: ProductVariant[];
}

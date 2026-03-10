import { Logger } from '@nestjs/common';
import { Field, Int, ObjectType, registerEnumType } from '@nestjs/graphql';
import slugify from 'slugify';
import {
  BeforeInsert,
  BeforeUpdate,
  Column,
  Entity,
  JoinTable,
  ManyToMany,
  OneToMany,
} from 'typeorm';

import { AbstractEntity } from '@/common/abstracts/entity.abstract';
import { MetadataResponse } from '@/common/graphql/metadata.response';
import { EProductStatus, EProductType } from '@/common/enums/product.enum';
import { StringUtil } from '@/common/utils/string.util';
import { Category } from '@/modules/categories/entities/category.entity';
import { ConversionUnit } from '@/modules/conversion-units/entities/conversion-unit.entity';
import { ProductAttributeValue } from '@/modules/product-attribute-values/entities/product-attribute-value.entity';
import { ProductAttribute } from '@/modules/product-attributes/entities/product-attribute.entity';
import { ProductReview } from '@/modules/product-reviews/entities/product-review.entity';
import { ProductVariant } from '@/modules/product-variants/entities/product-variant.entity';

registerEnumType(EProductType, {
  name: 'EProductType',
  description: 'Enum for product type',
});
registerEnumType(EProductStatus, {
  name: 'EProductStatus',
  description: 'Enum for product statuses',
});

@ObjectType({ description: 'product' })
@Entity({ name: 'products' })
export class Product extends AbstractEntity {
  @Field(() => String)
  @Column()
  name: string;

  @Field(() => String, { nullable: true })
  @Column()
  slug?: string;

  @Field(() => String, { nullable: true })
  @Column({ nullable: true })
  sku?: string;

  @Field(() => EProductType)
  @Column()
  type: string;

  @Field(() => [String], { nullable: true })
  @Column('text', { array: true, nullable: true })
  features?: string[];

  @Field(() => String, { nullable: true })
  @Column({ nullable: true })
  turnaround?: string;

  @Field(() => String, { nullable: true })
  @Column({ nullable: true })
  short_description?: string;

  @Field(() => String, { nullable: true })
  @Column({ nullable: true })
  description?: string;

  @Field(() => EProductStatus)
  @Column()
  status: string;

  @Field(() => Int, { nullable: true, defaultValue: 0 })
  @Column()
  likes?: number;

  @Field(() => Int, { nullable: true, defaultValue: 0 })
  @Column()
  average_rating?: number;

  @Field(() => Int, { nullable: true, defaultValue: 0 })
  @Column()
  rating_count?: number;

  @Field(() => Int, { nullable: true })
  @Column()
  thumbnail_id?: number;

  @Field(() => [Int], { nullable: true })
  @Column('int', { array: true, nullable: true })
  gallery_image_ids?: number[];

  @Field(() => [Int], { nullable: true })
  @Column('int', { array: true, nullable: true })
  attachment_ids?: number[];

  @Field(() => [Int], { nullable: true })
  @Column('int', { array: true, nullable: true })
  category_ids?: number[];

  @Field(() => Int, { nullable: true })
  @Column()
  base_unit_id?: number;

  @Field(() => [Int], { nullable: true })
  @Column('int', { array: true, nullable: true })
  attribute_ids?: number[];

  @Field(() => [Int], { nullable: true })
  @Column('int', { array: true, nullable: true })
  attribute_value_ids?: number[];

  @ManyToMany(() => Category, (category) => category.products, {
    cascade: true,
  })
  @JoinTable({
    name: 'product_category_relations',
    joinColumn: {
      name: 'product_id',
      referencedColumnName: 'id',
    },
    inverseJoinColumn: {
      name: 'category_id',
      referencedColumnName: 'id',
    },
  })
  categories: Category[];

  @ManyToMany(() => ProductAttribute, (productAttribute) => productAttribute.products, {
    cascade: true,
  })
  @JoinTable({
    name: 'product_attribute_relations',
    joinColumn: {
      name: 'product_id',
      referencedColumnName: 'id',
    },
    inverseJoinColumn: {
      name: 'attribute_id',
      referencedColumnName: 'id',
    },
  })
  attributes: ProductAttribute[];

  @ManyToMany(
    () => ProductAttributeValue,
    (productAttributeValue) => productAttributeValue.products,
    {
      cascade: true,
    },
  )
  @JoinTable({
    name: 'product_attribute_value_relations',
    joinColumn: {
      name: 'product_id',
      referencedColumnName: 'id',
    },
    inverseJoinColumn: {
      name: 'attribute_value_id',
      referencedColumnName: 'id',
    },
  })
  attribute_values: ProductAttributeValue[];

  @OneToMany(() => ConversionUnit, (conversionUnit) => conversionUnit.product, {
    cascade: true,
  })
  conversion_units: ConversionUnit[];

  @OneToMany(() => ProductVariant, (productVariant) => productVariant.product, {
    cascade: true,
  })
  variants: ProductVariant[];

  @OneToMany(() => ProductReview, (productReview) => productReview.product, {
    cascade: true,
  })
  reviews: ProductReview[];

  @BeforeInsert()
  @BeforeUpdate()
  async beforeInsertOrUpdate(): Promise<void> {
    try {
      if (!this.code) this.code = StringUtil.generateCode('PRD');
      if (!this.sku) this.sku = StringUtil.generateCode('SKU');

      this.slug = slugify(this.name, { trim: true, lower: true });
    } catch (error) {
      new Logger(Product.name).error(error);
      throw error;
    }
  }
}

@ObjectType()
export class GetProductType {
  @Field(() => MetadataResponse, { nullable: true })
  metadata?: MetadataResponse;

  @Field(() => [Product], { nullable: true })
  data?: Product[];
}

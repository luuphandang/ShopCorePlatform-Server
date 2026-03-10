import { Logger } from '@nestjs/common';
import { Field, Int, ObjectType, registerEnumType } from '@nestjs/graphql';
import slugify from 'slugify';
import {
  BeforeInsert,
  BeforeUpdate,
  Column,
  Entity,
  JoinColumn,
  JoinTable,
  ManyToMany,
  ManyToOne,
  OneToMany,
} from 'typeorm';

import { AbstractEntity } from '@/common/abstracts/entity.abstract';
import { MetadataResponse } from '@/common/graphql/metadata.response';
import { EProductStatus } from '@/common/enums/product.enum';
import { StringUtil } from '@/common/utils/string.util';
import { ConversionUnit } from '@/modules/conversion-units/entities/conversion-unit.entity';
import { ProductAttributeValue } from '@/modules/product-attribute-values/entities/product-attribute-value.entity';
import { ProductAttribute } from '@/modules/product-attributes/entities/product-attribute.entity';
import { Product } from '@/modules/products/entities/product.entity';

registerEnumType(EProductStatus, {
  name: 'EProductStatus',
  description: 'Enum for product statuses',
});

@ObjectType({ description: 'product_variant' })
@Entity({ name: 'product_variants' })
export class ProductVariant extends AbstractEntity {
  @Field(() => String)
  @Column()
  name: string;

  @Field(() => String, { nullable: true })
  @Column()
  slug: string;

  @Field(() => String, { nullable: true })
  @Column({ nullable: true })
  sku?: string;

  @Field(() => EProductStatus)
  @Column()
  status: string;

  @Field(() => String, { nullable: true })
  @Column({ nullable: true })
  description?: string;

  @Field(() => Int)
  @Column()
  product_id: number;

  @Field(() => [Int], { nullable: true })
  @Column('int', { array: true, nullable: true })
  gallery_image_ids?: number[];

  @Field(() => Int, { nullable: true })
  @Column()
  base_unit_id?: number;

  @Field(() => [Int], { nullable: true })
  @Column('int', { array: true, nullable: true })
  attribute_ids?: number[];

  @ManyToMany(() => ProductAttribute, (attribute) => attribute.variants, {
    cascade: true,
  })
  @JoinTable({
    name: 'product_variant_attribute_relations',
    joinColumn: {
      name: 'variant_id',
      referencedColumnName: 'id',
    },
    inverseJoinColumn: {
      name: 'attribute_id',
      referencedColumnName: 'id',
    },
  })
  attributes: ProductAttribute[];

  @Field(() => [Int], { nullable: true })
  @Column('int', { array: true, nullable: true })
  attribute_value_ids?: number[];

  @ManyToMany(
    () => ProductAttributeValue,
    (productAttributeValue) => productAttributeValue.variants,
    { cascade: true },
  )
  @JoinTable({
    name: 'product_variant_attribute_value_relations',
    joinColumn: {
      name: 'variant_id',
      referencedColumnName: 'id',
    },
    inverseJoinColumn: {
      name: 'attribute_value_id',
      referencedColumnName: 'id',
    },
  })
  attribute_values: ProductAttributeValue[];

  @OneToMany(() => ConversionUnit, (conversionUnit) => conversionUnit.variant, {
    cascade: true,
  })
  conversion_units: ConversionUnit[];

  @ManyToOne(() => Product, (product) => product.variants, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'product_id' })
  product: Product;

  @BeforeInsert()
  @BeforeUpdate()
  async beforeInsertOrUpdate(): Promise<void> {
    try {
      if (!this.code) this.code = StringUtil.generateCode('VAR');
      if (!this.sku) this.sku = StringUtil.generateCode('SKU');

      this.slug = slugify(this.name, { trim: true, lower: true });
    } catch (error) {
      new Logger(ProductVariant.name).error(error);
      throw error;
    }
  }
}

@ObjectType()
export class GetProductVariantType {
  @Field(() => MetadataResponse, { nullable: true })
  metadata?: MetadataResponse;

  @Field(() => [ProductVariant], { nullable: true })
  data?: ProductVariant[];
}

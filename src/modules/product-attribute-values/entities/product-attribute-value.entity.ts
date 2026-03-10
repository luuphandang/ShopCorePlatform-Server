import { Field, ObjectType } from '@nestjs/graphql';
import { Column, Entity, JoinColumn, ManyToMany, ManyToOne } from 'typeorm';

import { AbstractEntity } from '@/common/abstracts/entity.abstract';
import { MetadataResponse } from '@/common/graphql/metadata.response';
import { ProductAttribute } from '@/modules/product-attributes/entities/product-attribute.entity';
import { ProductVariant } from '@/modules/product-variants/entities/product-variant.entity';
import { Product } from '@/modules/products/entities/product.entity';

@ObjectType({ description: 'product_attribute_value' })
@Entity({ name: 'product_attribute_values' })
export class ProductAttributeValue extends AbstractEntity {
  @Field(() => Number)
  @Column()
  attribute_id: number;

  @Field(() => String)
  @Column()
  value: string;

  @ManyToOne(() => ProductAttribute, (attribute) => attribute.values, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'attribute_id' })
  attribute: ProductAttribute;

  @ManyToMany(() => Product, (product) => product.attribute_values)
  products: Product[];

  @ManyToMany(() => ProductVariant, (productVariant) => productVariant.attribute_values)
  variants: ProductVariant[];
}

@ObjectType()
export class GetAttributeValueType {
  @Field(() => MetadataResponse, { nullable: true })
  metadata?: MetadataResponse;

  @Field(() => [ProductAttributeValue], { nullable: true })
  data?: ProductAttributeValue[];
}

import { Field, ObjectType } from '@nestjs/graphql';
import { Column, Entity, ManyToMany, OneToMany } from 'typeorm';

import { AbstractEntity } from '@/common/abstracts/entity.abstract';
import { MetadataResponse } from '@/common/graphql/metadata.response';
import { ProductAttributeValue } from '@/modules/product-attribute-values/entities/product-attribute-value.entity';
import { ProductVariant } from '@/modules/product-variants/entities/product-variant.entity';
import { Product } from '@/modules/products/entities/product.entity';

@ObjectType({ description: 'product_attribute' })
@Entity({ name: 'product_attributes' })
export class ProductAttribute extends AbstractEntity {
  @Field(() => String)
  @Column()
  name: string;

  @ManyToMany(() => Product, (product) => product.attributes)
  products: Product[];

  @ManyToMany(() => ProductVariant, (variant) => variant.attributes)
  variants: ProductVariant[];

  @OneToMany(() => ProductAttributeValue, (value) => value.attribute)
  values: ProductAttributeValue[];
}

@ObjectType()
export class GetAttributeType {
  @Field(() => MetadataResponse, { nullable: true })
  metadata?: MetadataResponse;

  @Field(() => [ProductAttribute], { nullable: true })
  data?: ProductAttribute[];
}

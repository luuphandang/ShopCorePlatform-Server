import { Field, Int, ObjectType } from '@nestjs/graphql';
import { Column, Entity, JoinColumn, ManyToOne, OneToOne } from 'typeorm';

import { AbstractEntity } from '@/common/abstracts/entity.abstract';
import { MetadataResponse } from '@/common/graphql/metadata.response';
import { ProductVariant } from '@/modules/product-variants/entities/product-variant.entity';
import { Product } from '@/modules/products/entities/product.entity';
import { Unit } from '@/modules/units/entities/unit.entity';

@ObjectType({ description: 'conversion unit' })
@Entity({ name: 'conversion_units' })
export class ConversionUnit extends AbstractEntity {
  @Field(() => Int, { nullable: true })
  @Column({ nullable: true })
  product_id: number;

  @Field(() => Int, { nullable: true })
  @Column({ nullable: true })
  variant_id: number;

  @Field(() => Int)
  @Column()
  unit_id: number;

  @Field(() => Int, { defaultValue: 1 })
  @Column({ default: 1 })
  conversion_rate: number;

  @Field(() => Int, { defaultValue: 0 })
  @Column({ default: 0 })
  regular_price: number;

  @Field(() => Int, { defaultValue: 0 })
  @Column({ default: 0 })
  sale_price: number;

  @Field(() => Int, { defaultValue: 0 })
  @Column({ default: 0 })
  price: number;

  @ManyToOne(() => Product, (product) => product.conversion_units, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'product_id' })
  product: Product;

  @ManyToOne(() => ProductVariant, (variant) => variant.conversion_units, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'variant_id' })
  variant: ProductVariant;

  @OneToOne(() => Unit, (unit) => unit.id)
  @JoinColumn({ name: 'unit_id' })
  unit: Unit;
}

@ObjectType()
export class GetConversionUnitType {
  @Field(() => MetadataResponse, { nullable: true })
  metadata?: MetadataResponse;

  @Field(() => [ConversionUnit], { nullable: true })
  data?: ConversionUnit[];
}

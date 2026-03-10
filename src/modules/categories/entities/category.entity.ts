import { Logger } from '@nestjs/common';
import { Field, Int, ObjectType, registerEnumType } from '@nestjs/graphql';
import slugify from 'slugify';
import { BeforeInsert, BeforeUpdate, Column, Entity, ManyToMany } from 'typeorm';

import { AbstractEntity } from '@/common/abstracts/entity.abstract';
import { MetadataResponse } from '@/common/graphql/metadata.response';
import { ECategoryType } from '@/common/enums/category.enum';
import { Blog } from '@/modules/blogs/entities/blog.entity';
import { Product } from '@/modules/products/entities/product.entity';

registerEnumType(ECategoryType, {
  name: 'ECategoryType',
  description: 'Enum for category types',
});

@ObjectType({ description: 'category' })
@Entity({ name: 'categories' })
export class Category extends AbstractEntity {
  @Field(() => String)
  @Column()
  name: string;

  @Field(() => String)
  @Column()
  slug: string;

  @Field(() => ECategoryType)
  @Column({ type: 'enum', enum: ECategoryType })
  type: string;

  @Field(() => String, { nullable: true })
  @Column({ nullable: true })
  short_description?: string;

  @Field(() => String, { nullable: true })
  @Column({ nullable: true })
  description?: string;

  @Field(() => [String], { nullable: true })
  @Column('text', { array: true, nullable: true })
  keywords?: string[];

  @Field(() => Int, { nullable: true })
  @Column({ nullable: true })
  thumbnail_id?: number;

  @Field(() => Int, { nullable: true })
  @Column({ nullable: true })
  parent_id?: number;

  @Field(() => [Int], { nullable: true })
  @Column('int', { array: true, nullable: true })
  children_ids?: number[];

  @ManyToMany(() => Blog, (blog) => blog.categories)
  blogs: Blog[];

  @ManyToMany(() => Product, (product) => product.categories)
  products: Product[];

  @BeforeInsert()
  @BeforeUpdate()
  async beforeInsertOrUpdate(): Promise<void> {
    try {
      this.slug = slugify(this.name, { trim: true, lower: true });
    } catch (error) {
      new Logger(Category.name).error(error);
      throw error;
    }
  }
}

@ObjectType()
export class GetCategoryType {
  @Field(() => [Category], { nullable: true })
  data?: Category[];

  @Field(() => MetadataResponse, { nullable: true })
  metadata?: MetadataResponse;
}

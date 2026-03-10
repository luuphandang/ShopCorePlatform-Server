import { Field, Int, ObjectType } from '@nestjs/graphql';
import slugify from 'slugify';
import { BeforeInsert, BeforeUpdate, Column, Entity, JoinTable, ManyToMany } from 'typeorm';

import { AbstractEntity } from '@/common/abstracts/entity.abstract';
import { MetadataResponse } from '@/common/graphql/metadata.response';
import { Category } from '@/modules/categories/entities/category.entity';

@ObjectType({ description: 'blog' })
@Entity({ name: 'blogs' })
export class Blog extends AbstractEntity {
  @Field(() => String)
  @Column()
  title: string;

  @Field(() => String)
  @Column()
  slug: string;

  @Field(() => String)
  @Column()
  content: string;

  @Field(() => String, { nullable: true })
  @Column({ nullable: true })
  short_description?: string;

  @Field(() => String, { nullable: true })
  @Column({ nullable: true })
  meta_title?: string;

  @Field(() => String, { nullable: true })
  @Column({ nullable: true })
  meta_description?: string;

  @Field(() => String, { nullable: true })
  @Column({ nullable: true })
  meta_keywords?: string;

  @Field(() => String, { nullable: true })
  @Column({ nullable: true })
  meta_robots?: string;

  @Field(() => [Int], { nullable: true })
  @Column('int', { array: true, nullable: true })
  category_ids: number[];

  @ManyToMany(() => Category, (category) => category.blogs, { cascade: true })
  @JoinTable({
    name: 'blog_category_relations',
    joinColumn: {
      name: 'blog_id',
      referencedColumnName: 'id',
    },
    inverseJoinColumn: {
      name: 'category_id',
      referencedColumnName: 'id',
    },
  })
  categories: Category[];

  @BeforeInsert()
  @BeforeUpdate()
  async beforeInsertOrUpdate(): Promise<void> {
    try {
      this.slug = slugify(this.title, { trim: true, lower: true });
    } catch (error) {
      console.error('[Blog:Entity]:', error);
      throw error;
    }
  }
}

@ObjectType()
export class GetBlogType {
  @Field(() => MetadataResponse, { nullable: true })
  metadata?: MetadataResponse;

  @Field(() => [Blog], { nullable: true })
  data?: Blog[];
}

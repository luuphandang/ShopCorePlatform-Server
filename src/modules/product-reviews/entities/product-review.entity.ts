import { Field, Int, ObjectType } from '@nestjs/graphql';
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';

import { AbstractEntity } from '@/common/abstracts/entity.abstract';
import { MetadataResponse } from '@/common/graphql/metadata.response';
import { Product } from '@/modules/products/entities/product.entity';
import { User } from '@/modules/users/entities/user.entity';

@ObjectType({ description: 'product_review' })
@Entity({ name: 'product_reviews' })
export class ProductReview extends AbstractEntity {
  @Field(() => Int)
  @Column()
  user_id: number;

  @Field(() => Int)
  @Column()
  product_id: number;

  @Field(() => Int)
  @Column()
  rate: number;

  @Field(() => String)
  @Column()
  content: string;

  @Field(() => [Int], { nullable: true })
  @Column('int', { array: true, nullable: true })
  attachment_ids?: number[];

  @ManyToOne(() => Product, (product) => product.reviews, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'product_id' })
  product: Product;

  @ManyToOne(() => User, (user) => user.reviews, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'user_id' })
  user: User;
}

@ObjectType()
export class GetProductReviewType {
  @Field(() => MetadataResponse, { nullable: true })
  metadata?: MetadataResponse;

  @Field(() => [ProductReview], { nullable: true })
  data?: ProductReview[];
}

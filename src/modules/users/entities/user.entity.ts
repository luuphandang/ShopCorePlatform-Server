import { Logger } from '@nestjs/common';
import { Field, HideField, Int, ObjectType } from '@nestjs/graphql';
import { hash } from 'bcrypt';
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
import { ProductReview } from '@/modules/product-reviews/entities/product-review.entity';
import { Role } from '@/modules/roles/entities/role.entity';

const BCRYPT_HASH_ROUNDS = Number(process.env.BCRYPT_HASH_ROUNDS) || 10;

@ObjectType({ description: 'user' })
@Entity({ name: 'users' })
export class User extends AbstractEntity {
  @Field(() => String)
  @Column()
  code: string;

  @Field(() => String)
  @Column()
  phone: string;

  @HideField()
  @Column()
  password: string;

  @Field(() => String, { nullable: true })
  @Column({ nullable: true })
  first_name?: string;

  @Field(() => String)
  @Column()
  last_name: string;

  @Field(() => String, { nullable: true })
  @Column({ nullable: true })
  email?: string;

  @Field(() => String, { nullable: true })
  @Column({ nullable: true })
  address?: string;

  @Field(() => String, { nullable: true })
  @Column({ type: 'date', nullable: true })
  birthday?: string;

  @HideField()
  @Column({ nullable: true })
  refresh_token?: string;

  @Field(() => Int, { nullable: true })
  @Column({ nullable: true })
  avatar_id?: number;

  @Field(() => [Int], { nullable: true })
  @Column('int', { array: true, nullable: true })
  role_ids?: number[];

  @ManyToMany(() => Role, (role) => role.users, { cascade: true })
  @JoinTable({
    name: 'user_role_relations',
    joinColumn: {
      name: 'user_id',
      referencedColumnName: 'id',
    },
    inverseJoinColumn: {
      name: 'role_id',
      referencedColumnName: 'id',
    },
  })
  roles: Role[];

  @OneToMany(() => ProductReview, (productReview) => productReview.user, {
    cascade: true,
  })
  reviews: ProductReview[];

  @BeforeInsert()
  @BeforeUpdate()
  async beforeInsertOrUpdate(): Promise<void> {
    try {
      if (this.password && !this.password.startsWith('$2b$')) {
        this.password = await hash(this.password, BCRYPT_HASH_ROUNDS);
      }

      if (!this.created_by) {
        this.created_by = this.id;
      }

      if (!this.updated_by) {
        this.updated_by = this.id;
      }
    } catch (error) {
      new Logger(User.name).error(error);
      throw error;
    }
  }
}

@ObjectType()
export class GetUserType {
  @Field(() => MetadataResponse, { nullable: true })
  metadata?: MetadataResponse;

  @Field(() => [User], { nullable: true })
  data?: User[];
}

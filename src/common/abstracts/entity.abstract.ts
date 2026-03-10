import { Field, Int, ObjectType } from '@nestjs/graphql';
import {
  BeforeInsert,
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import { CODE_PREFIX } from '../constants/code-prefix.constant';
import { StringUtil } from '../utils/string.util';

@ObjectType()
export abstract class AbstractEntity {
  @Field(() => Int)
  @PrimaryGeneratedColumn()
  id: number;

  @Field(() => String)
  @Column()
  code: string;

  @Field(() => Boolean, { nullable: true, defaultValue: true })
  @Column({ nullable: true, default: true })
  is_active?: boolean;

  @Field(() => Int, { nullable: true })
  @Column({ nullable: true })
  created_by?: number;

  @Field(() => Date, { nullable: true })
  @CreateDateColumn()
  created_at?: Date;

  @Field(() => Int, { nullable: true })
  @Column({ nullable: true })
  updated_by?: number;

  @Field(() => Date, { nullable: true })
  @UpdateDateColumn()
  updated_at?: Date;

  @Field(() => Int, { nullable: true, defaultValue: null })
  @Column({ nullable: true, default: null })
  deleted_by?: number;

  @Field(() => Date, { nullable: true })
  @DeleteDateColumn()
  deleted_at?: Date;

  @BeforeInsert()
  async generateCode(): Promise<void> {
    try {
      if (!this.code) {
        this.code = StringUtil.generateCode(CODE_PREFIX[this.constructor.name]);
      }
    } catch (error) {
      console.error(`[${this.constructor.name}:Entity]:`, error);
      throw error;
    }
  }
}

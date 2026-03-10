import { Field, Float, ObjectType } from '@nestjs/graphql';
import { Column, Entity } from 'typeorm';

import { AbstractEntity } from '@/common/abstracts/entity.abstract';
import { MetadataResponse } from '@/common/graphql/metadata.response';

@ObjectType({ description: 'address' })
@Entity({ name: 'addresses' })
export class Address extends AbstractEntity {
  @Field(() => String)
  @Column()
  name?: string;

  @Field(() => String)
  @Column()
  phone: string;

  @Field(() => String, { nullable: true })
  @Column({ nullable: true })
  email?: string;

  @Field(() => String)
  @Column()
  address: string;

  @Field(() => String, { nullable: true })
  @Column({ nullable: true })
  ward?: string;

  @Field(() => String, { nullable: true })
  @Column({ nullable: true })
  district?: string;

  @Field(() => String, { nullable: true })
  @Column({ nullable: true })
  province?: string;

  @Field(() => String, { nullable: true })
  @Column({ nullable: true })
  country?: string;

  @Field(() => String, { nullable: true })
  @Column({ nullable: true })
  postal_code?: string;

  @Field(() => Float, { nullable: true })
  @Column({ nullable: true })
  latitude?: number;

  @Field(() => Float, { nullable: true })
  @Column({ nullable: true })
  longitude?: number;

  @Field(() => Boolean, { nullable: true, defaultValue: false })
  @Column({ nullable: true, default: false })
  is_default?: boolean;
}

@ObjectType()
export class GetAddressType {
  @Field(() => MetadataResponse, { nullable: true })
  metadata?: MetadataResponse;

  @Field(() => [Address], { nullable: true })
  data?: Address[];
}

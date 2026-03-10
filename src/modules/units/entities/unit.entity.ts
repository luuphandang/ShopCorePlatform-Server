import { Field, ObjectType } from '@nestjs/graphql';
import slugify from 'slugify';
import { BeforeInsert, BeforeUpdate, Column, Entity, OneToMany } from 'typeorm';

import { AbstractEntity } from '@/common/abstracts/entity.abstract';
import { MetadataResponse } from '@/common/graphql/metadata.response';
import { ConversionUnit } from '@/modules/conversion-units/entities/conversion-unit.entity';

@ObjectType({ description: 'unit' })
@Entity({ name: 'units' })
export class Unit extends AbstractEntity {
  @Field(() => String)
  @Column()
  name: string;

  @Field(() => String)
  @Column()
  slug: string;

  @Field(() => String, { nullable: true })
  @Column({ nullable: true })
  description?: string;

  @OneToMany(() => ConversionUnit, (conversionUnit) => conversionUnit.unit, {
    cascade: true,
  })
  conversion_units: ConversionUnit[];

  @BeforeInsert()
  @BeforeUpdate()
  async beforeInsertOrUpdate(): Promise<void> {
    try {
      this.slug = slugify(this.name, { trim: true, lower: true });
    } catch (error) {
      console.error('[Unit:Entity]:', error);
      throw error;
    }
  }
}

@ObjectType()
export class GetUnitType {
  @Field(() => MetadataResponse, { nullable: true })
  metadata?: MetadataResponse;

  @Field(() => [Unit], { nullable: true })
  data?: Unit[];
}

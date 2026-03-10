import { Field, ObjectType } from '@nestjs/graphql';
import { Column, Entity, ManyToMany } from 'typeorm';

import { AbstractEntity } from '@/common/abstracts/entity.abstract';
import { MetadataResponse } from '@/common/graphql/metadata.response';
import { Role } from '@/modules/roles/entities/role.entity';

@ObjectType({ description: 'permission' })
@Entity({ name: 'permissions' })
export class Permission extends AbstractEntity {
  @Field(() => String)
  @Column()
  label: string;

  @Field(() => String)
  @Column()
  value: string;

  @ManyToMany(() => Role, (role) => role.permissions)
  roles: Role[];
}

@ObjectType()
export class GetPermissionType {
  @Field(() => MetadataResponse, { nullable: true })
  metadata?: MetadataResponse;

  @Field(() => [Permission], { nullable: true })
  data?: Permission[];
}

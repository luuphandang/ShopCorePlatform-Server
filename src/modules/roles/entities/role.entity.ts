import { Field, Int, ObjectType } from '@nestjs/graphql';
import { Column, Entity, JoinTable, ManyToMany } from 'typeorm';

import { AbstractEntity } from '@/common/abstracts/entity.abstract';
import { MetadataResponse } from '@/common/graphql/metadata.response';
import { Permission } from '@/modules/permissions/entities/permission.entity';
import { User } from '@/modules/users/entities/user.entity';

@ObjectType({ description: 'role' })
@Entity({ name: 'roles' })
export class Role extends AbstractEntity {
  @Field(() => String)
  @Column()
  name: string;

  @Field(() => String, { nullable: true })
  @Column({ nullable: true })
  description?: string;

  @Field(() => [Int], { nullable: true })
  @Column('int', { array: true, nullable: true })
  permission_ids?: number[];

  @ManyToMany(() => User, (user) => user.roles)
  users: User[];

  @ManyToMany(() => Permission, (permission) => permission.roles, {
    cascade: true,
  })
  @JoinTable({
    name: 'role_permission_relations',
    joinColumn: {
      name: 'role_id',
      referencedColumnName: 'id',
    },
    inverseJoinColumn: {
      name: 'permission_id',
      referencedColumnName: 'id',
    },
  })
  permissions: Permission[];
}

@ObjectType()
export class GetRoleType {
  @Field(() => MetadataResponse, { nullable: true })
  metadata?: MetadataResponse;

  @Field(() => [Role], { nullable: true })
  data?: Role[];
}

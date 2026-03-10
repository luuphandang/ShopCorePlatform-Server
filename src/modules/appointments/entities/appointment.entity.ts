import { Logger } from '@nestjs/common';
import { Field, Int, ObjectType, registerEnumType } from '@nestjs/graphql';
import { BeforeInsert, BeforeUpdate, Column, Entity } from 'typeorm';

import { AbstractEntity } from '@/common/abstracts/entity.abstract';
import { MetadataResponse } from '@/common/graphql/metadata.response';
import { EAppointmentStatus } from '@/common/enums/appointment.enum';

registerEnumType(EAppointmentStatus, {
  name: 'EAppointmentStatus',
  description: 'Enum for appointment status',
});

@ObjectType({ description: 'appointment' })
@Entity({ name: 'appointments' })
export class Appointment extends AbstractEntity {
  @Field(() => Int, { nullable: true })
  @Column({ nullable: true })
  customer_id?: number;

  @Field(() => String)
  @Column()
  name: string;

  @Field(() => String)
  @Column()
  phone: string;

  @Field(() => String, { nullable: true })
  @Column({ nullable: true })
  email?: string;

  @Field(() => String)
  @Column()
  title: string;

  @Field(() => String)
  @Column()
  content: string;

  @Field(() => EAppointmentStatus, { nullable: true, defaultValue: EAppointmentStatus.PENDING })
  @Column({ type: 'enum', enum: EAppointmentStatus, default: EAppointmentStatus.PENDING })
  status?: EAppointmentStatus;

  @Field(() => [Int], { nullable: true })
  @Column('int', { array: true, nullable: true })
  attachment_ids?: number[];

  @BeforeInsert()
  @BeforeUpdate()
  async beforeInsertOrUpdate(): Promise<void> {
    try {
      if (!this.status) {
        this.status = EAppointmentStatus.PENDING;
      }
    } catch (error) {
      new Logger(Appointment.name).error(error);
      throw error;
    }
  }
}

@ObjectType()
export class GetAppointmentType {
  @Field(() => MetadataResponse, { nullable: true })
  metadata?: MetadataResponse;

  @Field(() => [Appointment], { nullable: true })
  data?: Appointment[];
}

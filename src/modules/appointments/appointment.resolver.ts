import { UseInterceptors } from '@nestjs/common';
import {
  Args,
  Context,
  Int,
  Mutation,
  Parent,
  Query,
  ResolveField,
  Resolver,
} from '@nestjs/graphql';

import { AbstractResolver } from '@/common/abstracts/resolver.abstract';
import { CoreContext } from '@/common/contexts';
import { UseAuthGuard } from '@/common/decorators/auth-guard.decorator';
import { CurrentUser } from '@/common/decorators/user.decorator';
import { GetManyInput, GetOneInput } from '@/common/graphql/query.input';
import { QueryManyInterceptor } from '@/common/interceptors/query-many.interceptor';
import { QueryOneInterceptor } from '@/common/interceptors/query-one.interceptor';
import { PERMISSIONS } from '@/common/constants/permission.constant';
import { ValidateStatusTransition } from '@/common/decorators/validate-status-transition.decorator';
import { EAppointmentStatus } from '@/common/enums/appointment.enum';

import { FileUpload } from '../file-uploads/entities/file-upload.entity';
import { User } from '../users/entities/user.entity';
import { AppointmentService } from './appointment.service';
import { Appointment, GetAppointmentType } from './entities/appointment.entity';
import { CreateAppointmentInput } from './inputs/create-appointment.input';
import { UpdateAppointmentInput } from './inputs/update-appointment.input';

@Resolver(() => Appointment)
export class AppointmentResolver extends AbstractResolver<AppointmentService> {
  constructor(
    coreContext: CoreContext,
    private readonly appointmentService: AppointmentService,
  ) {
    super(coreContext, appointmentService);
  }

  @Query(() => Appointment, { nullable: true })
  @UseAuthGuard([PERMISSIONS.MY_APPOINTMENT])
  @UseInterceptors(QueryOneInterceptor)
  async myAppointment(
    @Args({ name: 'query', nullable: true })
    condition: GetOneInput<Appointment>,
  ): Promise<Appointment> {
    return await this.appointmentService.getOne(condition);
  }

  @Query(() => GetAppointmentType)
  @UseAuthGuard([PERMISSIONS.MY_APPOINTMENT])
  @UseInterceptors(QueryManyInterceptor)
  async myAppointments(
    @Args({ name: 'query', nullable: true })
    query: GetManyInput<Appointment>,
  ): Promise<GetAppointmentType> {
    return await this.appointmentService.getPagination(query);
  }

  @Query(() => Appointment, { nullable: true })
  @UseAuthGuard([PERMISSIONS.VIEW_APPOINTMENT])
  @UseInterceptors(QueryOneInterceptor)
  async appointment(
    @Args({ name: 'query', nullable: true })
    condition: GetOneInput<Appointment>,
  ): Promise<Appointment> {
    return await this.appointmentService.getOne(condition);
  }

  @Query(() => GetAppointmentType)
  @UseAuthGuard([PERMISSIONS.VIEW_APPOINTMENT])
  @UseInterceptors(QueryManyInterceptor)
  async appointments(
    @Args({ name: 'query', nullable: true })
    query: GetManyInput<Appointment>,
  ): Promise<GetAppointmentType> {
    return await this.appointmentService.getPagination(query);
  }

  @Mutation(() => Appointment)
  @UseAuthGuard([PERMISSIONS.CREATE_APPOINTMENT])
  async createAppointment(
    @Args('data') data: CreateAppointmentInput,
    @CurrentUser() user: User,
  ): Promise<Appointment> {
    return await this.appointmentService.create(data, { performedBy: user });
  }

  @Mutation(() => Appointment)
  @UseAuthGuard([PERMISSIONS.UPDATE_APPOINTMENT])
  async updateAppointment(
    @Args('id', { type: () => Int }) id: number,
    @Args('data') data: UpdateAppointmentInput,
    @CurrentUser() user: User,
  ): Promise<Appointment> {
    return await this.appointmentService.update(id, data, { performedBy: user });
  }

  @Mutation(() => Appointment, { nullable: true })
  @UseAuthGuard([PERMISSIONS.DELETE_APPOINTMENT])
  async deleteAppointment(
    @Args('id', { type: () => Int }) id: number,
    @CurrentUser() user: User,
  ): Promise<Appointment | null> {
    return await this.appointmentService.delete(id, { performedBy: user });
  }

  @Mutation(() => Appointment)
  @ValidateStatusTransition(EAppointmentStatus.PENDING)
  async pendingAppointment(
    @Args('id', { type: () => Int }) id: number,
    @CurrentUser() user: User,
  ): Promise<Appointment> {
    return await this.appointmentService.pendingAppointment(id, { performedBy: user });
  }

  @Mutation(() => Appointment)
  @ValidateStatusTransition(EAppointmentStatus.CONFIRMED)
  async confirmedAppointment(
    @Args('id', { type: () => Int }) id: number,
    @CurrentUser() user: User,
  ): Promise<Appointment> {
    return await this.appointmentService.confirmedAppointment(id, { performedBy: user });
  }

  @Mutation(() => Appointment)
  @ValidateStatusTransition(EAppointmentStatus.COMPLETED)
  async completedAppointment(
    @Args('id', { type: () => Int }) id: number,
    @CurrentUser() user: User,
  ): Promise<Appointment> {
    return await this.appointmentService.completedAppointment(id, { performedBy: user });
  }

  @Mutation(() => Appointment)
  @ValidateStatusTransition(EAppointmentStatus.CANCELLED)
  async cancelledAppointment(
    @Args('id', { type: () => Int }) id: number,
    @CurrentUser() user: User,
  ): Promise<Appointment> {
    return await this.appointmentService.cancelledAppointment(id, { performedBy: user });
  }

  // Resolve Field

  @ResolveField(() => User, { nullable: true })
  async customer(
    @Parent() appointment: Appointment,
    @Context() { loaders }: IGraphQLContext,
  ): Promise<User> {
    if (!appointment.customer_id) return null;

    const usersMap = await loaders.users.load([appointment.customer_id]);
    return usersMap.get(appointment.customer_id);
  }

  @ResolveField(() => [FileUpload], { nullable: true })
  async attachments(
    @Parent() appointment: Appointment,
    @Context() { loaders }: IGraphQLContext,
  ): Promise<FileUpload[]> {
    if (!Array.isArray(appointment.attachment_ids) || !appointment.attachment_ids.length) return [];

    const attachmentsMap = await loaders.fileUploads.load(appointment.attachment_ids);
    return appointment.attachment_ids
      .map((id) => attachmentsMap.get(id))
      .filter((attachment): attachment is FileUpload => attachment !== undefined);
  }

  @ResolveField(() => User, { nullable: true })
  async creator(
    @Parent() appointment: Appointment,
    @Context() { loaders }: IGraphQLContext,
  ): Promise<User> {
    if (!appointment.created_by) return null;

    const usersMap = await loaders.users.load([appointment.created_by]);
    return usersMap.get(appointment.created_by);
  }

  @ResolveField(() => User, { nullable: true })
  async updater(
    @Parent() appointment: Appointment,
    @Context() { loaders }: IGraphQLContext,
  ): Promise<User> {
    if (!appointment.updated_by) return null;

    const usersMap = await loaders.users.load([appointment.updated_by]);
    return usersMap.get(appointment.updated_by);
  }
}

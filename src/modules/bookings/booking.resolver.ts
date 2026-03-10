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

import { Category } from '../categories/entities/category.entity';
import { FileUpload } from '../file-uploads/entities/file-upload.entity';
import { Product } from '../products/entities/product.entity';
import { User } from '../users/entities/user.entity';
import { BookingService } from './booking.service';
import { Booking, GetBookingType } from './entities/booking.entity';
import { CreateBookingInput } from './inputs/create-booking.input';
import { UpdateBookingInput } from './inputs/update-booking.input';

@Resolver(() => Booking)
export class BookingResolver extends AbstractResolver<BookingService> {
  constructor(
    coreContext: CoreContext,
    private readonly bookingService: BookingService,
  ) {
    super(coreContext, bookingService);
  }

  @Query(() => Booking, { nullable: true })
  @UseInterceptors(QueryOneInterceptor)
  async myBooking(
    @Args({ name: 'query', nullable: true })
    condition: GetOneInput<Booking>,
  ): Promise<Booking> {
    return await this.bookingService.getOne(condition);
  }

  @Query(() => GetBookingType)
  @UseInterceptors(QueryManyInterceptor)
  async myBookings(
    @Args({ name: 'query', nullable: true })
    query: GetManyInput<Booking>,
  ): Promise<GetBookingType> {
    return await this.bookingService.getPagination(query);
  }

  @Query(() => Booking, { nullable: true })
  @UseAuthGuard([PERMISSIONS.VIEW_BOOKING])
  @UseInterceptors(QueryOneInterceptor)
  async booking(
    @Args({ name: 'query', nullable: true })
    condition: GetOneInput<Booking>,
  ): Promise<Booking> {
    return await this.bookingService.getOne(condition);
  }

  @Query(() => GetBookingType)
  @UseAuthGuard([PERMISSIONS.VIEW_BOOKING])
  @UseInterceptors(QueryManyInterceptor)
  async bookings(
    @Args({ name: 'query', nullable: true })
    query: GetManyInput<Booking>,
  ): Promise<GetBookingType> {
    return await this.bookingService.getPagination(query);
  }

  @Mutation(() => Booking)
  @UseAuthGuard([PERMISSIONS.CREATE_BOOKING])
  async createBooking(
    @Args('data') data: CreateBookingInput,
    @CurrentUser() user: User,
  ): Promise<Booking> {
    return await this.bookingService.create(data, { performedBy: user });
  }

  @Mutation(() => Booking)
  @UseAuthGuard([PERMISSIONS.UPDATE_BOOKING])
  async updateBooking(
    @Args('id', { type: () => Int }) id: number,
    @Args('data') data: UpdateBookingInput,
    @CurrentUser() user: User,
  ): Promise<Booking> {
    return await this.bookingService.update(id, data, { performedBy: user });
  }

  @Mutation(() => Booking, { nullable: true })
  @UseAuthGuard([PERMISSIONS.DELETE_BOOKING])
  async deleteBooking(
    @Args('id', { type: () => Int }) id: number,
    @CurrentUser() user: User,
  ): Promise<Booking | null> {
    return await this.bookingService.delete(id, { performedBy: user });
  }

  @Mutation(() => Booking)
  async pendingBooking(
    @Args('id', { type: () => Int }) id: number,
    @CurrentUser() user: User,
  ): Promise<Booking> {
    return await this.bookingService.pendingBooking(id, { performedBy: user });
  }

  @Mutation(() => Booking)
  async confirmedBooking(
    @Args('id', { type: () => Int }) id: number,
    @CurrentUser() user: User,
  ): Promise<Booking> {
    return await this.bookingService.confirmedBooking(id, { performedBy: user });
  }

  @Mutation(() => Booking)
  async completedBooking(
    @Args('id', { type: () => Int }) id: number,
    @CurrentUser() user: User,
  ): Promise<Booking> {
    return await this.bookingService.completedBooking(id, { performedBy: user });
  }

  @Mutation(() => Booking)
  async cancelledBooking(
    @Args('id', { type: () => Int }) id: number,
    @CurrentUser() user: User,
  ): Promise<Booking> {
    return await this.bookingService.cancelledBooking(id, { performedBy: user });
  }

  // Resolve fields

  @ResolveField(() => User, { nullable: true })
  async customer(
    @Parent() booking: Booking,
    @Context() { loaders }: IGraphQLContext,
  ): Promise<User> {
    if (!booking.customer_id) return null;

    const customer = await loaders.users.load([booking.customer_id]);
    return customer.get(booking.customer_id);
  }

  @ResolveField(() => [Category], { nullable: true })
  async categories(
    @Parent() booking: Booking,
    @Context() { loaders }: IGraphQLContext,
  ): Promise<Category[]> {
    if (!booking.category_ids) return null;

    const categories = await loaders.categories.load(booking.category_ids);
    return booking.category_ids
      .map((id) => categories.get(id))
      .filter((category): category is Category => category !== undefined);
  }

  @ResolveField(() => [Product], { nullable: true })
  async products(
    @Parent() booking: Booking,
    @Context() { loaders }: IGraphQLContext,
  ): Promise<Product[]> {
    if (!booking.product_ids) return null;

    const products = await loaders.products.load(booking.product_ids);
    return booking.product_ids
      .map((id) => products.get(id))
      .filter((product): product is Product => product !== undefined);
  }

  @ResolveField(() => [FileUpload], { nullable: true })
  async attachments(
    @Parent() booking: Booking,
    @Context() { loaders }: IGraphQLContext,
  ): Promise<FileUpload[]> {
    if (!Array.isArray(booking.attachment_ids) || !booking.attachment_ids.length) return [];

    const attachmentsMap = await loaders.fileUploads.load(booking.attachment_ids);
    return booking.attachment_ids
      .map((id) => attachmentsMap.get(id))
      .filter((attachment): attachment is FileUpload => attachment !== undefined);
  }

  @ResolveField(() => User, { nullable: true })
  async creator(
    @Parent() booking: Booking,
    @Context() { loaders }: IGraphQLContext,
  ): Promise<User> {
    if (!booking.created_by) return null;

    const users = await loaders.users.load([booking.created_by]);
    return users.get(booking.created_by);
  }

  @ResolveField(() => User, { nullable: true })
  async updater(
    @Parent() booking: Booking,
    @Context() { loaders }: IGraphQLContext,
  ): Promise<User> {
    if (!booking.updated_by) return null;

    const users = await loaders.users.load([booking.updated_by]);
    return users.get(booking.updated_by);
  }
}

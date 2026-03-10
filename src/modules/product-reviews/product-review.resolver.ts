import { UseInterceptors } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
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
import { UseAuthGuard } from '@/common/decorators/auth-guard.decorator';
import { CurrentUser } from '@/common/decorators/user.decorator';
import { GetManyInput, GetOneInput } from '@/common/graphql/query.input';
import { EnvironmentVariables } from '@/common/helpers/env.validation';
import { QueryManyInterceptor } from '@/common/interceptors/query-many.interceptor';
import { QueryOneInterceptor } from '@/common/interceptors/query-one.interceptor';
import { AppLogger } from '@/common/logger/logger.service';
import { PERMISSIONS } from '@/common/constants/permission.constant';
import { UtilService } from '@/common/utils/util.service';

import { FileUpload } from '../file-uploads/entities/file-upload.entity';
import { User } from '../users/entities/user.entity';
import { GetProductReviewType, ProductReview } from './entities/product-review.entity';
import { CreateProductReviewInput } from './inputs/create-product-review.input';
import { UpdateProductReviewInput } from './inputs/update-product-review.input';
import { ProductReviewService } from './product-review.service';

@Resolver(() => ProductReview)
export class ProductReviewResolver extends AbstractResolver<ProductReviewService> {
  constructor(
    appLogger: AppLogger,
    configService: ConfigService<EnvironmentVariables>,
    utilService: UtilService,

    private readonly productReviewService: ProductReviewService,
  ) {
    super(configService, utilService, appLogger, productReviewService);
  }

  @Query(() => ProductReview, { nullable: true })
  @UseAuthGuard([PERMISSIONS.VIEW_REVIEW])
  @UseInterceptors(QueryOneInterceptor)
  async review(
    @Args({ name: 'query', nullable: true })
    condition: GetOneInput<ProductReview>,
  ): Promise<ProductReview> {
    return await this.productReviewService.getOne(condition);
  }

  @Query(() => GetProductReviewType)
  @UseAuthGuard([PERMISSIONS.VIEW_REVIEW])
  @UseInterceptors(QueryManyInterceptor)
  async reviews(
    @Args({ name: 'query', nullable: true })
    query: GetManyInput<ProductReview>,
  ): Promise<GetProductReviewType> {
    return await this.productReviewService.getPagination(query);
  }

  @Mutation(() => ProductReview)
  @UseAuthGuard([PERMISSIONS.CREATE_REVIEW])
  async createReview(
    @Args('data') data: CreateProductReviewInput,
    @CurrentUser() user: User,
  ): Promise<ProductReview> {
    return await this.productReviewService.create(data, { performedBy: user });
  }

  @Mutation(() => ProductReview)
  @UseAuthGuard([PERMISSIONS.UPDATE_REVIEW])
  async updateReview(
    @Args('id', { type: () => Int }) id: number,
    @Args('data') data: UpdateProductReviewInput,
    @CurrentUser() user: User,
  ): Promise<ProductReview> {
    return await this.productReviewService.update(id, data, { performedBy: user });
  }

  @Mutation(() => ProductReview, { nullable: true })
  @UseAuthGuard([PERMISSIONS.DELETE_REVIEW])
  async deleteReview(
    @Args('id', { type: () => Int }) id: number,
    @CurrentUser() user: User,
  ): Promise<ProductReview | null> {
    return await this.productReviewService.delete(id, { performedBy: user });
  }

  @ResolveField(() => [FileUpload], { nullable: true })
  async attachments(
    @Parent() review: ProductReview,
    @Context() { loaders }: IGraphQLContext,
  ): Promise<FileUpload[]> {
    if (!Array.isArray(review.attachment_ids) || !review.attachment_ids?.length) return [];

    const attachmentsMap = await loaders.fileUploads.load(review.attachment_ids);
    return review.attachment_ids
      .map((id) => attachmentsMap.get(id))
      .filter((attachment): attachment is FileUpload => attachment !== undefined);
  }

  @ResolveField(() => User, { nullable: true })
  async creator(
    @Parent() review: ProductReview,
    @Context() { loaders }: IGraphQLContext,
  ): Promise<User> {
    if (!review.created_by) return null;

    const usersMap = await loaders.users.load([review.created_by]);
    return usersMap.get(review.created_by);
  }

  @ResolveField(() => User, { nullable: true })
  async updater(
    @Parent() review: ProductReview,
    @Context() { loaders }: IGraphQLContext,
  ): Promise<User> {
    if (!review.updated_by) return null;

    const usersMap = await loaders.users.load([review.updated_by]);
    return usersMap.get(review.updated_by);
  }
}

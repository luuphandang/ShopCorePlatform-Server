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

import { ProductAttributeValue } from '../product-attribute-values/entities/product-attribute-value.entity';
import { User } from '../users/entities/user.entity';
import { GetAttributeType, ProductAttribute } from './entities/product-attribute.entity';
import { CreateProductAttributeInput } from './inputs/create-product-attribute.input';
import { UpdateProductAttributeInput } from './inputs/update-product-attribute.input';
import { ProductAttributeService } from './product-attribute.service';

@Resolver(() => ProductAttribute)
export class ProductAttributeResolver extends AbstractResolver<ProductAttributeService> {
  constructor(
    configService: ConfigService<EnvironmentVariables>,
    utilService: UtilService,
    appLogger: AppLogger,

    private readonly productAttributeService: ProductAttributeService,
  ) {
    super(configService, utilService, appLogger, productAttributeService);
  }

  @Query(() => ProductAttribute, { nullable: true })
  @UseInterceptors(QueryOneInterceptor)
  async productAttribute(
    @Args({ name: 'query', nullable: true }) condition: GetOneInput<ProductAttribute>,
  ): Promise<ProductAttribute> {
    const attribute = await this.productAttributeService.getOne(condition);

    return attribute;
  }

  @Query(() => GetAttributeType)
  @UseInterceptors(QueryManyInterceptor)
  async productAttributes(
    @Args({ name: 'query', nullable: true }) query: GetManyInput<ProductAttribute>,
  ): Promise<GetAttributeType> {
    const attributes = await this.productAttributeService.getPagination(query);

    return attributes;
  }

  @Mutation(() => ProductAttribute)
  @UseAuthGuard([PERMISSIONS.CREATE_ATTRIBUTE])
  async createProductAttribute(
    @Args('data') data: CreateProductAttributeInput,
    @CurrentUser() user: User,
  ): Promise<ProductAttribute> {
    return await this.productAttributeService.create(data, { performedBy: user });
  }

  @Mutation(() => ProductAttribute)
  @UseAuthGuard([PERMISSIONS.UPDATE_ATTRIBUTE])
  async updateProductAttribute(
    @Args('id', { type: () => Int }) id: number,
    @Args('data') data: UpdateProductAttributeInput,
    @CurrentUser() user: User,
  ): Promise<ProductAttribute> {
    return await this.productAttributeService.update(id, data, { performedBy: user });
  }

  @Mutation(() => ProductAttribute, { nullable: true })
  @UseAuthGuard([PERMISSIONS.DELETE_ATTRIBUTE])
  async deleteProductAttribute(
    @Args('id', { type: () => Int }) id: number,
    @CurrentUser() user: User,
  ): Promise<ProductAttribute | null> {
    return await this.productAttributeService.delete(id, { performedBy: user });
  }

  @ResolveField(() => [ProductAttributeValue], { nullable: true })
  async values(
    @Parent() attribute: ProductAttribute,
    @Context() { loaders }: IGraphQLContext,
  ): Promise<ProductAttributeValue[]> {
    if (!attribute.id) return [];

    const valuesMap = await loaders.productAttributeRelated.values.load([attribute.id]);
    return valuesMap.get(attribute.id) || [];
  }

  @ResolveField(() => User, { nullable: true })
  async creator(@Parent() user: User, @Context() { loaders }: IGraphQLContext): Promise<User> {
    if (!user.created_by) return null;

    const usersMap = await loaders.users.load([user.created_by]);
    return usersMap.get(user.created_by);
  }

  @ResolveField(() => User, { nullable: true })
  async updater(@Parent() user: User, @Context() { loaders }: IGraphQLContext): Promise<User> {
    if (!user.updated_by) return null;

    const usersMap = await loaders.users.load([user.updated_by]);
    return usersMap.get(user.updated_by);
  }
}

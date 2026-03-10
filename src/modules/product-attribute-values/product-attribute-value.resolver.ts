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

import { User } from '../users/entities/user.entity';
import {
  GetAttributeValueType,
  ProductAttributeValue,
} from './entities/product-attribute-value.entity';
import { CreateProductAttributeValueInput } from './inputs/create-product-attribute-value.input';
import { UpdateProductAttributeValueInput } from './inputs/update-product-attribute-value.input';
import { ProductAttributeValueService } from './product-attribute-value.service';

@Resolver(() => ProductAttributeValue)
export class ProductAttributeValueResolver extends AbstractResolver<ProductAttributeValueService> {
  constructor(
    coreContext: CoreContext,
    private readonly productAttributeValueService: ProductAttributeValueService,
  ) {
    super(coreContext, productAttributeValueService);
  }

  @Query(() => ProductAttributeValue, { nullable: true })
  @UseInterceptors(QueryOneInterceptor)
  async productAttributeValue(
    @Args({ name: 'query', nullable: true }) condition: GetOneInput<ProductAttributeValue>,
  ): Promise<ProductAttributeValue> {
    const value = await this.productAttributeValueService.getOne(condition);

    return value;
  }

  @Query(() => GetAttributeValueType)
  @UseInterceptors(QueryManyInterceptor)
  async productAttributeValues(
    @Args({ name: 'query', nullable: true }) query: GetManyInput<ProductAttributeValue>,
  ): Promise<GetAttributeValueType> {
    const values = await this.productAttributeValueService.getPagination(query);

    return values;
  }

  @Mutation(() => ProductAttributeValue)
  @UseAuthGuard([PERMISSIONS.CREATE_ATTRIBUTE_VALUE])
  async createProductAttributeValue(
    @Args('data') data: CreateProductAttributeValueInput,
    @CurrentUser() user: User,
  ): Promise<ProductAttributeValue> {
    return await this.productAttributeValueService.create(data, { performedBy: user });
  }

  @Mutation(() => ProductAttributeValue)
  @UseAuthGuard([PERMISSIONS.UPDATE_ATTRIBUTE_VALUE])
  async updateProductAttributeValue(
    @Args('id', { type: () => Int }) id: number,
    @Args('data') data: UpdateProductAttributeValueInput,
    @CurrentUser() user: User,
  ): Promise<ProductAttributeValue> {
    return await this.productAttributeValueService.update(id, data, { performedBy: user });
  }

  @Mutation(() => ProductAttributeValue, { nullable: true })
  @UseAuthGuard([PERMISSIONS.DELETE_ATTRIBUTE_VALUE])
  async deleteProductAttributeValue(
    @Args('id', { type: () => Int }) id: number,
    @CurrentUser() user: User,
  ): Promise<ProductAttributeValue | null> {
    return await this.productAttributeValueService.delete(id, { performedBy: user });
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

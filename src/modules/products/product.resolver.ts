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

import { Category } from '../categories/entities/category.entity';
import { ConversionUnit } from '../conversion-units/entities/conversion-unit.entity';
import { FileUpload } from '../file-uploads/entities/file-upload.entity';
import { ProductAttributeValue } from '../product-attribute-values/entities/product-attribute-value.entity';
import { ProductAttribute } from '../product-attributes/entities/product-attribute.entity';
import { ProductReview } from '../product-reviews/entities/product-review.entity';
import { ProductVariant } from '../product-variants/entities/product-variant.entity';
import { User } from '../users/entities/user.entity';
import { GetProductType, Product } from './entities/product.entity';
import { CreateProductInput } from './inputs/create-product.input';
import { UpdateProductInput } from './inputs/update-product.input';
import { ProductService } from './product.service';

@Resolver(() => Product)
export class ProductResolver extends AbstractResolver<ProductService> {
  constructor(
    configService: ConfigService<EnvironmentVariables>,
    utilService: UtilService,
    appLogger: AppLogger,

    private readonly productService: ProductService,
  ) {
    super(configService, utilService, appLogger, productService);
  }

  @Query(() => Product, { nullable: true })
  @UseInterceptors(QueryOneInterceptor)
  async product(
    @Args({ name: 'query', nullable: true }) condition: GetOneInput<Product>,
  ): Promise<Product> {
    return await this.productService.getOne(condition);
  }

  @Query(() => GetProductType)
  @UseInterceptors(QueryManyInterceptor)
  async products(
    @Args({ name: 'query', nullable: true })
    query: GetManyInput<Product>,
  ): Promise<GetProductType> {
    return await this.productService.getPagination(query);
  }

  @Mutation(() => Product)
  @UseAuthGuard([PERMISSIONS.CREATE_PRODUCT])
  async createProduct(
    @Args('data') data: CreateProductInput,
    @CurrentUser() user: User,
  ): Promise<Product> {
    return await this.productService.createProduct(data, { performedBy: user });
  }

  @Mutation(() => Product)
  @UseAuthGuard([PERMISSIONS.UPDATE_PRODUCT])
  async updateProduct(
    @Args('id', { type: () => Int }) id: number,
    @Args('data') data: UpdateProductInput,
    @CurrentUser() user: User,
  ): Promise<Product> {
    return await this.productService.updateProduct(id, data, { performedBy: user });
  }

  @Mutation(() => Product, { nullable: true })
  @UseAuthGuard([PERMISSIONS.DELETE_PRODUCT])
  async deleteProduct(
    @Args('id', { type: () => Int }) id: number,
    @CurrentUser() user: User,
  ): Promise<Product | null> {
    return await this.productService.delete(id, { performedBy: user });
  }

  @ResolveField(() => FileUpload, { nullable: true })
  async thumbnail(
    @Parent() product: Product,
    @Context() { loaders }: IGraphQLContext,
  ): Promise<FileUpload> {
    if (!product.thumbnail_id) return null;

    const thumbnailsMap = await loaders.fileUploads.load([product.thumbnail_id]);
    return thumbnailsMap.get(product.thumbnail_id);
  }

  @ResolveField(() => [FileUpload], { nullable: true })
  async gallery_images(
    @Parent() product: Product,
    @Context() { loaders }: IGraphQLContext,
  ): Promise<FileUpload[]> {
    if (!Array.isArray(product.gallery_image_ids) || !product.gallery_image_ids.length) return [];

    const imagesMap = await loaders.fileUploads.load(product.gallery_image_ids);
    return product.gallery_image_ids
      .map((id) => imagesMap.get(id))
      .filter((image): image is FileUpload => image !== undefined);
  }

  @ResolveField(() => [FileUpload], { nullable: true })
  async attachments(
    @Parent() product: Product,
    @Context() { loaders }: IGraphQLContext,
  ): Promise<FileUpload[]> {
    if (!Array.isArray(product.attachment_ids) || !product.attachment_ids.length) return [];

    const attachmentsMap = await loaders.fileUploads.load(product.attachment_ids);
    return product.attachment_ids
      .map((id) => attachmentsMap.get(id))
      .filter((attachment): attachment is FileUpload => attachment !== undefined);
  }

  @ResolveField(() => ConversionUnit, { nullable: true })
  async base_unit(
    @Parent() product: Product,
    @Context() { loaders }: IGraphQLContext,
  ): Promise<ConversionUnit> {
    if (!product.base_unit_id) return null;
    const baseUnitMap = await loaders.conversionUnits.load([product.base_unit_id]);

    return baseUnitMap.get(product.base_unit_id);
  }

  @ResolveField(() => [ConversionUnit], { nullable: true })
  async conversion_units(
    @Parent() product: Product,
    @Context() { loaders }: IGraphQLContext,
  ): Promise<ConversionUnit[]> {
    if (!product.id) return [];
    const unitsMap = await loaders.productRelated.conversionUnits.load([product.id]);

    return unitsMap.get(product.id) || [];
  }

  @ResolveField(() => [Category], { nullable: true })
  async categories(
    @Parent() product: Product,
    @Context() { loaders }: IGraphQLContext,
  ): Promise<Category[]> {
    if (!Array.isArray(product.category_ids) || !product.category_ids.length) return [];

    const categoriesMap = await loaders.categories.load(product.category_ids);
    return product.category_ids
      .map((id) => categoriesMap.get(id))
      .filter((category): category is Category => category !== undefined);
  }

  @ResolveField(() => [ProductAttribute], { nullable: true })
  async attributes(
    @Parent() product: Product,
    @Context() { loaders }: IGraphQLContext,
  ): Promise<ProductAttribute[]> {
    if (!Array.isArray(product.attribute_ids) || !product.attribute_ids.length) return [];
    if (!Array.isArray(product.attribute_value_ids) || !product.attribute_value_ids.length)
      return [];

    const attributesMap = await loaders.productAttributes.load(product.attribute_ids);
    const attributeValuesMap = await loaders.productAttributeValues.load(
      product.attribute_value_ids,
    );

    return product.attribute_ids
      .map((id) => {
        const attribute = attributesMap.get(id);
        if (!attribute) return null;

        attribute.values = product.attribute_value_ids
          .map((id) => attributeValuesMap.get(id))
          .filter(
            (value): value is ProductAttributeValue =>
              value !== undefined && value.attribute_id === id,
          );

        return attribute;
      })
      .filter((attribute): attribute is ProductAttribute => attribute !== undefined);
  }

  @ResolveField(() => [ProductAttributeValue], { nullable: true })
  async values(
    @Parent() product: Product,
    @Context() { loaders }: IGraphQLContext,
  ): Promise<ProductAttributeValue[]> {
    if (!Array.isArray(product.attribute_value_ids) || !product.attribute_value_ids.length)
      return [];

    const attributeValuesMap = await loaders.productAttributeValues.load(
      product.attribute_value_ids,
    );

    return product.attribute_value_ids
      .map((id) => attributeValuesMap.get(id))
      .filter((value): value is ProductAttributeValue => value !== undefined);
  }

  @ResolveField(() => [ProductVariant], { nullable: true })
  async variants(
    @Parent() product: Product,
    @Context() { loaders }: IGraphQLContext,
  ): Promise<ProductVariant[]> {
    if (!product.id) return [];
    const variantsMap = await loaders.productRelated.variants.load([product.id]);

    return variantsMap.get(product.id) || [];
  }

  @ResolveField(() => [ProductReview], { nullable: true })
  async product_reviews(
    @Parent() product: Product,
    @Context() { loaders }: IGraphQLContext,
  ): Promise<ProductReview[]> {
    if (!product.id) return [];

    const reviewsMap = await loaders.productRelated.reviews.load([product.id]);
    return reviewsMap.get(product.id);
  }
  @ResolveField(() => User, { nullable: true })
  async creator(
    @Parent() product: Product,
    @Context() { loaders }: IGraphQLContext,
  ): Promise<User> {
    if (!product.created_by) return null;

    const usersMap = await loaders.users.load([product.created_by]);
    return usersMap.get(product.created_by);
  }

  @ResolveField(() => User, { nullable: true })
  async updater(
    @Parent() product: Product,
    @Context() { loaders }: IGraphQLContext,
  ): Promise<User> {
    if (!product.updated_by) return null;

    const usersMap = await loaders.users.load([product.updated_by]);
    return usersMap.get(product.updated_by);
  }
}

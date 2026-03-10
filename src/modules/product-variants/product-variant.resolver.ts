import { Context, Parent, ResolveField, Resolver } from '@nestjs/graphql';

import { AbstractResolver } from '@/common/abstracts/resolver.abstract';
import { CoreContext } from '@/common/contexts';

import { ConversionUnit } from '../conversion-units/entities/conversion-unit.entity';
import { FileUpload } from '../file-uploads/entities/file-upload.entity';
import { ProductAttributeValue } from '../product-attribute-values/entities/product-attribute-value.entity';
import { ProductAttribute } from '../product-attributes/entities/product-attribute.entity';
import { User } from '../users/entities/user.entity';
import { ProductVariant } from './entities/product-variant.entity';
import { ProductVariantService } from './product-variant.service';

@Resolver(() => ProductVariant)
export class ProductVariantResolver extends AbstractResolver<ProductVariantService> {
  constructor(
    coreContext: CoreContext,
    private readonly productVariantService: ProductVariantService,
  ) {
    super(coreContext, productVariantService);
  }

  @ResolveField(() => [FileUpload], { nullable: true })
  async gallery_images(
    @Parent() variant: ProductVariant,
    @Context() { loaders }: IGraphQLContext,
  ): Promise<FileUpload[]> {
    if (!Array.isArray(variant.gallery_image_ids) || !variant.gallery_image_ids.length) return [];

    const imagesMap = await loaders.fileUploads.load(variant.gallery_image_ids);
    return variant.gallery_image_ids
      .map((id) => imagesMap.get(id))
      .filter((image): image is FileUpload => image !== undefined);
  }

  @ResolveField(() => [ProductAttribute], { nullable: true })
  async attributes(
    @Parent() variant: ProductVariant,
    @Context() { loaders }: IGraphQLContext,
  ): Promise<ProductAttribute[]> {
    if (!Array.isArray(variant.attribute_ids) || !variant.attribute_ids.length) return [];
    if (!Array.isArray(variant.attribute_value_ids) || !variant.attribute_value_ids.length)
      return [];

    const attributesMap = await loaders.productAttributes.load(variant.attribute_ids);
    const attributeValuesMap = await loaders.productAttributeValues.load(
      variant.attribute_value_ids,
    );

    return variant.attribute_ids
      .map((id) => {
        const attribute = attributesMap.get(id);
        if (!attribute) return null;

        attribute.values = variant.attribute_value_ids
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
    @Parent() variant: ProductVariant,
    @Context() { loaders }: IGraphQLContext,
  ): Promise<ProductAttributeValue[]> {
    if (!Array.isArray(variant.attribute_value_ids) || !variant.attribute_value_ids.length)
      return [];

    const attributeValuesMap = await loaders.productAttributeValues.load(
      variant.attribute_value_ids,
    );

    return variant.attribute_value_ids
      .map((id) => attributeValuesMap.get(id))
      .filter((value): value is ProductAttributeValue => value !== undefined);
  }

  @ResolveField(() => ConversionUnit, { nullable: true })
  async base_unit(
    @Parent() variant: ProductVariant,
    @Context() { loaders }: IGraphQLContext,
  ): Promise<ConversionUnit> {
    if (!variant.base_unit_id) return null;
    const baseUnitMap = await loaders.conversionUnits.load([variant.base_unit_id]);

    return baseUnitMap.get(variant.base_unit_id);
  }

  @ResolveField(() => [ConversionUnit], { nullable: true })
  async conversion_units(
    @Parent() variant: ProductVariant,
    @Context() { loaders }: IGraphQLContext,
  ): Promise<ConversionUnit[]> {
    if (!variant.id) return [];
    const unitsMap = await loaders.productVariantRelated.conversionUnits.load([variant.id]);

    return unitsMap.get(variant.id) || [];
  }

  @ResolveField(() => User, { nullable: true })
  async creator(
    @Parent() variant: ProductVariant,
    @Context() { loaders }: IGraphQLContext,
  ): Promise<User> {
    if (!variant.created_by) return null;

    const usersMap = await loaders.users.load([variant.created_by]);
    return usersMap.get(variant.created_by);
  }

  @ResolveField(() => User, { nullable: true })
  async updater(
    @Parent() variant: ProductVariant,
    @Context() { loaders }: IGraphQLContext,
  ): Promise<User> {
    if (!variant.updated_by) return null;

    const usersMap = await loaders.users.load([variant.updated_by]);
    return usersMap.get(variant.updated_by);
  }
}

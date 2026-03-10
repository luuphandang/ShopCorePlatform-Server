import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class MetadataResponse {
  @Field(() => Number, { nullable: true })
  current_page?: number;

  @Field(() => Number, { nullable: true })
  page_size?: number;

  @Field(() => Number, { nullable: true })
  total_items?: number;

  @Field(() => Number, { nullable: true })
  total_pages?: number;
}

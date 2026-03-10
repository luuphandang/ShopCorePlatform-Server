import { Field, InputType, Int, registerEnumType } from '@nestjs/graphql';
import { IsEnum, IsNotEmpty, IsOptional } from 'class-validator';
import { GraphQLJSON } from 'graphql-scalars';
import { FindOptionsOrder } from 'typeorm';

import { EPaginationType } from '../enums/common.enum';
import { IWhere } from '../types/where.type';

registerEnumType(EPaginationType, {
  name: 'EPaginationType',
  description: 'Enum for graphql pagination types',
});

@InputType()
export class IPagination {
  @Field(() => Int, { description: 'Started from 0', nullable: true })
  @IsOptional()
  page?: number;

  @Field(() => Int, { description: 'Size of page', nullable: true })
  @IsOptional()
  limit?: number;

  @Field(() => EPaginationType, { nullable: true, description: 'Pagination type' })
  @IsOptional()
  @IsEnum(EPaginationType, {
    message: `Chỉ áp dụng các giá trị ${Object.values(EPaginationType).join(', ')}!`,
  })
  pagination_type?: string;
}

@InputType()
export class GetOneInput<T> {
  @Field(() => GraphQLJSON)
  @IsNotEmpty()
  where: IWhere<T>;
}

@InputType()
export class GetManyInput<T> {
  @Field(() => GraphQLJSON, { nullable: true })
  @IsOptional()
  where?: IWhere<T>;

  @Field(() => IPagination, { nullable: true })
  @IsOptional()
  pagination?: IPagination;

  @Field(() => GraphQLJSON, {
    nullable: true,
    description: '{key: ASC or DESC}',
  })
  @IsOptional()
  order?: FindOptionsOrder<T>;
}

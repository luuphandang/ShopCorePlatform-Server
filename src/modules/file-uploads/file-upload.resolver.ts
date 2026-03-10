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
import { FileUpload, GetFileUploadType } from './entities/file-upload.entity';
import { FileUploadService } from './file-upload.service';
import { CreateFileUploadInput } from './inputs/create-file-upload.input';
import { AdminSignedUrlInput, SignedUrlInput, SignedUrlResponse } from './inputs/signed-url.input';
import { UpdateFileUploadInput } from './inputs/update-file-upload.input';

@Resolver(() => FileUpload)
export class FileUploadResolver extends AbstractResolver<FileUploadService> {
  constructor(
    coreContext: CoreContext,
    private readonly fileUploadService: FileUploadService,
  ) {
    super(coreContext, fileUploadService);
  }

  @Query(() => FileUpload, { nullable: true })
  @UseAuthGuard([PERMISSIONS.MY_FILE])
  @UseInterceptors(QueryOneInterceptor)
  async myFile(
    @Args({ name: 'query', nullable: true }) condition: GetOneInput<FileUpload>,
  ): Promise<FileUpload> {
    return await this.fileUploadService.getOne(condition);
  }

  @Query(() => GetFileUploadType)
  @UseAuthGuard([PERMISSIONS.MY_FILE])
  @UseInterceptors(QueryManyInterceptor)
  async myFiles(
    @Args({ name: 'query', nullable: true })
    query: GetManyInput<FileUpload>,
  ): Promise<GetFileUploadType> {
    return await this.fileUploadService.getPagination(query);
  }

  @Query(() => FileUpload, { nullable: true })
  @UseAuthGuard([PERMISSIONS.VIEW_FILE])
  @UseInterceptors(QueryOneInterceptor)
  async file(
    @Args({ name: 'query', nullable: true }) condition: GetOneInput<FileUpload>,
  ): Promise<FileUpload> {
    return await this.fileUploadService.getOne(condition);
  }

  @Query(() => GetFileUploadType)
  @UseAuthGuard([PERMISSIONS.VIEW_FILE])
  @UseInterceptors(QueryManyInterceptor)
  async files(
    @Args({ name: 'query', nullable: true })
    query: GetManyInput<FileUpload>,
  ): Promise<GetFileUploadType> {
    return await this.fileUploadService.getPagination(query);
  }

  @Mutation(() => SignedUrlResponse)
  async websiteSignedUrl(
    @Args('data') data: SignedUrlInput,
    @CurrentUser() user: User,
  ): Promise<SignedUrlResponse> {
    return await this.fileUploadService.websiteSignedUrl(data, { performedBy: user });
  }

  @Mutation(() => SignedUrlResponse)
  async adminSignedUrl(
    @Args('data') data: AdminSignedUrlInput,
    @CurrentUser() user: User,
  ): Promise<SignedUrlResponse> {
    return await this.fileUploadService.adminSignedUrl(data, { performedBy: user });
  }

  @Mutation(() => FileUpload)
  @UseAuthGuard([PERMISSIONS.CREATE_FILE])
  async createFile(
    @Args('data') data: CreateFileUploadInput,
    @CurrentUser() user: User,
  ): Promise<FileUpload> {
    return await this.fileUploadService.create(data, { performedBy: user });
  }

  @Mutation(() => FileUpload)
  @UseAuthGuard([PERMISSIONS.UPDATE_FILE])
  async updateFile(
    @Args('id', { type: () => Int }) id: number,
    @Args('data') data: UpdateFileUploadInput,
    @CurrentUser() user: User,
  ): Promise<FileUpload> {
    return await this.fileUploadService.update(id, data, { performedBy: user });
  }

  @Mutation(() => FileUpload, { nullable: true })
  @UseAuthGuard([PERMISSIONS.DELETE_FILE])
  async deleteFile(
    @Args('id', { type: () => Int }) id: number,
    @CurrentUser() user: User,
  ): Promise<FileUpload | null> {
    return await this.fileUploadService.delete(id, { performedBy: user });
  }

  @ResolveField(() => User, { nullable: true })
  async owner(@Parent() file: FileUpload, @Context() { loaders }: IGraphQLContext): Promise<User> {
    if (!file.owner_by) return null;

    const usersMap = await loaders.users.load([file.owner_by]);
    return usersMap.get(file.owner_by);
  }

  @ResolveField(() => User, { nullable: true })
  async creator(
    @Parent() fileUpload: FileUpload,
    @Context() { loaders }: IGraphQLContext,
  ): Promise<User> {
    if (!fileUpload.created_by) return null;

    const usersMap = await loaders.users.load([fileUpload.created_by]);
    return usersMap.get(fileUpload.created_by);
  }

  @ResolveField(() => User, { nullable: true })
  async updater(
    @Parent() fileUpload: FileUpload,
    @Context() { loaders }: IGraphQLContext,
  ): Promise<User> {
    if (!fileUpload.updated_by) return null;

    const usersMap = await loaders.users.load([fileUpload.updated_by]);
    return usersMap.get(fileUpload.updated_by);
  }
}

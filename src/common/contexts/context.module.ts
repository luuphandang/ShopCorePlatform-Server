import { Global, Module } from '@nestjs/common';

import { CoreContext } from './core.context';
import { EventContext } from './event.context';
import { RepositoryContext } from './repository.context';
import { ServiceContext } from './service.context';

@Global()
@Module({
  providers: [CoreContext, RepositoryContext, ServiceContext, EventContext],
  exports: [CoreContext, RepositoryContext, ServiceContext, EventContext],
})
export class ContextModule {}

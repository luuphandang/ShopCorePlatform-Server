import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';

import { CsrfMiddleware } from './csrf.middleware';
import { SecurityMiddleware } from './security.middleware';

@Module({})
export class SecurityModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(SecurityMiddleware).forRoutes('*');
    consumer.apply(CsrfMiddleware).forRoutes('graphql');
  }
}

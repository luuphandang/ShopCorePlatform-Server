import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { BlogRepository } from './blog.repository';
import { BlogResolver } from './blog.resolver';
import { BlogService } from './blog.service';
import { BlogEventsController } from './blog-events.controller';
import { Blog } from './entities/blog.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Blog])],
  providers: [BlogEventsController, BlogResolver, BlogService, BlogRepository],
  controllers: [BlogEventsController],
  exports: [BlogService, BlogRepository],
})
export class BlogModule {}

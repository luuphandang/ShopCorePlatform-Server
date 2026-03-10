import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { CategoryRepository } from './category.repository';
import { CategoryResolver } from './category.resolver';
import { CategoryService } from './category.service';
import { CategoryEventsController } from './category-events.controller';
import { Category } from './entities/category.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Category])],
  providers: [CategoryEventsController, CategoryResolver, CategoryService, CategoryRepository],
  controllers: [CategoryEventsController],
  exports: [CategoryService, CategoryRepository],
})
export class CategoryModule {}

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { OrderDetail } from './entities/order-detail.entity';
import { OrderDetailRepository } from './order-detail.repository';
import { OrderDetailResolver } from './order-detail.resolver';
import { OrderDetailService } from './order-detail.service';
import { OrderDetailEventsController } from './order-detail-events.controller';

@Module({
  imports: [TypeOrmModule.forFeature([OrderDetail])],
  providers: [
    OrderDetailEventsController,
    OrderDetailResolver,
    OrderDetailService,
    OrderDetailRepository,
  ],
  controllers: [OrderDetailEventsController],
  exports: [OrderDetailService, OrderDetailRepository],
})
export class OrderDetailModule {}

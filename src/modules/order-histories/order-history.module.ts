import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { OrderHistory } from './entities/order-history.entity';
import { OrderHistoryRepository } from './order-history.repository';
import { OrderHistoryResolver } from './order-history.resolver';
import { OrderHistoryService } from './order-history.service';
import { OrderHistoryEventsController } from './order-history-events.controller';

@Module({
  imports: [TypeOrmModule.forFeature([OrderHistory])],
  providers: [
    OrderHistoryEventsController,
    OrderHistoryResolver,
    OrderHistoryService,
    OrderHistoryRepository,
  ],
  controllers: [OrderHistoryEventsController],
  exports: [OrderHistoryService, OrderHistoryResolver],
})
export class OrderHistoryModule {}

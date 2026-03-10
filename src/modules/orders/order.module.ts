import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { OrderDetail } from '../order-details/entities/order-detail.entity';
import { Order } from './entities/order.entity';
import { OrderRepository } from './order.repository';
import { OrderResolver } from './order.resolver';
import { OrderService } from './order.service';
import { OrderEventsController } from './order-events.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Order, OrderDetail])],
  providers: [OrderEventsController, OrderResolver, OrderService, OrderRepository],
  controllers: [OrderEventsController],
  exports: [OrderService, OrderRepository],
})
export class OrderModule {}

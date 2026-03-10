import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { OrderDetail } from '../order-details/entities/order-detail.entity';
import { Order } from '../orders/entities/order.entity';
import { OrderRepository } from '../orders/order.repository';
import { CartResolver } from './cart.resolver';
import { CartService } from './cart.service';
import { CartEventsController } from './cart-events.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Order, OrderDetail])],
  providers: [CartEventsController, CartResolver, CartService, OrderRepository],
  controllers: [CartEventsController],
  exports: [CartService, OrderRepository],
})
export class CartModule {}

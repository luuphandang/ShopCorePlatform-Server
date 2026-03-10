import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { OrderShipping } from './entities/order-shipping.entity';
import { OrderShippingRepository } from './order-shipping.repository';
import { OrderShippingResolver } from './order-shipping.resolver';
import { OrderShippingService } from './order-shipping.service';
import { OrderShippingEventsController } from './order-shipping-events.controller';

@Module({
  imports: [TypeOrmModule.forFeature([OrderShipping])],
  providers: [
    OrderShippingEventsController,
    OrderShippingResolver,
    OrderShippingService,
    OrderShippingRepository,
  ],
  controllers: [OrderShippingEventsController],
  exports: [OrderShippingService, OrderShippingResolver],
})
export class OrderShippingModule {}

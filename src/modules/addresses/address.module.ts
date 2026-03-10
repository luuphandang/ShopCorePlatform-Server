import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AddressRepository } from './address.repository';
import { AddressResolver } from './address.resolver';
import { AddressService } from './address.service';
import { AddressEventsController } from './address-events.controller';
import { Address } from './entities/address.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Address])],
  providers: [AddressEventsController, AddressResolver, AddressService, AddressRepository],
  controllers: [AddressEventsController],
  exports: [AddressService, AddressResolver],
})
export class AddressModule {}

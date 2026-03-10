import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Unit } from './entities/unit.entity';
import { UnitRepository } from './unit.repository';
import { UnitResolver } from './unit.resolver';
import { UnitService } from './unit.service';
import { UnitEventsController } from './unit-events.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Unit])],
  providers: [UnitEventsController, UnitResolver, UnitService, UnitRepository],
  controllers: [UnitEventsController],
  exports: [UnitService, UnitRepository],
})
export class UnitModule {}

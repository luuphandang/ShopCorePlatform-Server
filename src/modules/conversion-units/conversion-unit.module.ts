import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Unit } from '../units/entities/unit.entity';
import { ConversionUnitRepository } from './conversion-unit.repository';
import { ConversionUnitResolver } from './conversion-unit.resolver';
import { ConversionUnitService } from './conversion-unit.service';
import { ConversionUnitEventsController } from './conversion-unit-events.controller';
import { ConversionUnit } from './entities/conversion-unit.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ConversionUnit, Unit])],
  providers: [
    ConversionUnitEventsController,
    ConversionUnitResolver,
    ConversionUnitService,
    ConversionUnitRepository,
  ],
  controllers: [ConversionUnitEventsController],
  exports: [ConversionUnitService, ConversionUnitRepository],
})
export class ConversionUnitModule {}

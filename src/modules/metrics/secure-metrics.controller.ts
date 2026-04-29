import './metrics.registry';

import { Controller, Get, Header, Res, UseGuards } from '@nestjs/common';
import { SkipThrottle } from '@nestjs/throttler';
import { PrometheusController } from '@willsoto/nestjs-prometheus';
import { Response } from 'express';

import { MetricsAuthGuard } from './metrics-auth.guard';

@Controller('metrics')
@SkipThrottle()
@UseGuards(MetricsAuthGuard)
export class SecureMetricsController extends PrometheusController {
  @Get()
  @Header('Cache-Control', 'no-store')
  async index(@Res({ passthrough: true }) response: Response) {
    return super.index(response);
  }
}

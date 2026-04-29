import './metrics.registry';

import { Module } from '@nestjs/common';
import { PrometheusModule } from '@willsoto/nestjs-prometheus';

import { MetricsAuthGuard } from './metrics-auth.guard';
import { SecureMetricsController } from './secure-metrics.controller';

@Module({
  imports: [
    PrometheusModule.register({
      controller: SecureMetricsController,
      defaultMetrics: { enabled: true },
    }),
  ],
  providers: [MetricsAuthGuard],
})
export class MetricsModule {}

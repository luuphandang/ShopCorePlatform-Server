import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Request, Response } from 'express';
import { Observable, tap } from 'rxjs';

import { httpRequestDuration } from '@/modules/metrics/metrics.registry';

@Injectable()
export class MetricsInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    if (context.getType() !== 'http') {
      return next.handle();
    }

    const start = process.hrtime.bigint();
    const httpCtx = context.switchToHttp();
    const req = httpCtx.getRequest<Request>();
    const res = httpCtx.getResponse<Response>();

    const observe = (status: 'success' | 'error'): void => {
      const durationSeconds = Number(process.hrtime.bigint() - start) / 1e9;
      const route =
        (req.route?.path as string | undefined) ??
        (req.baseUrl ? `${req.baseUrl}${req.path}` : req.path) ??
        'unknown';
      const httpStatus = res.statusCode;
      const finalStatus = status === 'success' && httpStatus >= 500 ? 'error' : status;
      httpRequestDuration
        .labels(req.method ?? 'UNKNOWN', String(route), String(finalStatus))
        .observe(durationSeconds);
    };

    return next.handle().pipe(
      tap({
        next: () => observe('success'),
        error: () => observe('error'),
      }),
    );
  }
}

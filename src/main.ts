import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import cookieParser from 'cookie-parser';

import { AppModule } from './app.module';
import { CoreContext } from './common/contexts';
import { AppExceptionFilter } from './common/filters/app-exception.filter';
import { HandleRequestInterceptor } from './common/interceptors/logging.interceptor';
import { MetricsInterceptor } from './common/interceptors/metrics.interceptor';
import { SanitizeInterceptor } from './common/interceptors/sanitize.interceptor';
import { AppLogger } from './common/logger/logger.service';

async function bootstrap(): Promise<void> {
  const PORT = process.env.PORT ?? 3670;

  const app = await NestFactory.create(AppModule, { bufferLogs: true });

  app.enableShutdownHooks();

  const coreContext = app.get(CoreContext);
  const logger = app.get(AppLogger);
  const interceptor = new HandleRequestInterceptor(coreContext);
  const filter = new AppExceptionFilter(coreContext);
  const pipe = new ValidationPipe();

  app.useLogger(logger);

  logger.log('Application is starting...', 'Bootstrap');

  app.use(cookieParser());

  app.useGlobalInterceptors(new SanitizeInterceptor(), interceptor, new MetricsInterceptor());

  app.useGlobalFilters(filter);

  app.useGlobalPipes(pipe);

  const corsOrigins = process.env.CROSS_ORIGIN
    ? process.env.CROSS_ORIGIN.split(',').map((o) => o.trim())
    : ['http://localhost:3671'];

  app.enableCors({
    origin: corsOrigins,
    methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE'],
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization', 'x-csrf-token'],
    exposedHeaders: ['X-Total-Count', 'Set-Cookie'],
  });

  await app.listen(PORT, () => {
    logger.log(`Application started at: http://localhost:${PORT}`, 'Bootstrap');
  });
}

bootstrap();

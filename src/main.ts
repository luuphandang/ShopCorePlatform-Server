import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import cookieParser from 'cookie-parser';

import { AppModule } from './app.module';
import { CoreContext } from './common/contexts';
import { AppExceptionFilter } from './common/filters/app-exception.filter';
import { HandleRequestInterceptor } from './common/interceptors/logging.interceptor';
import { AppLogger } from './common/logger/logger.service';

async function bootstrap(): Promise<void> {
  const PORT = process.env.PORT ?? 3670;

  const app = await NestFactory.create(AppModule, { bufferLogs: true });

  const coreContext = app.get(CoreContext);
  const logger = app.get(AppLogger);

  app.useLogger(logger);

  logger.log('Application is starting...', 'Bootstrap');

  app.use(cookieParser());

  app.useGlobalInterceptors(new HandleRequestInterceptor(coreContext));

  app.useGlobalFilters(new AppExceptionFilter(coreContext));

  app.useGlobalPipes(new ValidationPipe());

  app.enableCors({
    origin:
      process.env.NODE_ENV === 'production'
        ? ['https://photocopy99.com', 'https://www.photocopy99.com']
        : [
            'http://localhost:3671',
            'http://127.0.0.1:3671',
            'http://localhost:3672',
            'http://127.0.0.1:3672',
          ],
    methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE'],
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization'],
    exposedHeaders: ['X-Total-Count'],
  });

  await app.listen(PORT, () => {
    logger.log(`Application started at: http://localhost:${PORT}`, 'Bootstrap');
  });
}

bootstrap();

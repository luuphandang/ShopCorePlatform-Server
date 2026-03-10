import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import cookieParser from 'cookie-parser';

import { AppModule } from './app.module';
import { AppExceptionFilter } from './common/filters/app-exception.filter';
import { EnvironmentVariables } from './common/helpers/env.validation';
import { HandleRequestInterceptor } from './common/interceptors/logging.interceptor';
import { AppLogger } from './common/logger/logger.service';
import { UtilService } from './common/utils/util.service';

async function bootstrap(): Promise<void> {
  const PORT = process.env.PORT ?? 3670;

  const app = await NestFactory.create(AppModule, { bufferLogs: true });

  const configService = app.get(ConfigService<EnvironmentVariables>);
  const utilService = app.get(UtilService);
  const logger = app.get(AppLogger);

  app.useLogger(logger);

  logger.log('Application is starting...', 'Bootstrap');

  app.use(cookieParser());

  app.useGlobalInterceptors(new HandleRequestInterceptor(configService, utilService, logger));

  app.useGlobalFilters(new AppExceptionFilter(configService, utilService, logger));

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

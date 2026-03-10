import { Injectable, LoggerService } from '@nestjs/common';
import { createLogger, format, Logger, transports } from 'winston';
import 'winston-daily-rotate-file';

// Logger level: error > warn > info > http > verbose > debug > silly

@Injectable()
export class AppLogger implements LoggerService {
  private readonly logger: Logger;

  constructor() {
    const fileFormat = format.combine(
      format.timestamp(),
      format.printf(({ timestamp, level, message, context }) => {
        return `${timestamp} [${level.toUpperCase()}]: { context: ${context || 'N/A'}, timestamp: ${timestamp}, message: ${message} }`;
      }),
    );

    this.logger = createLogger({
      level: 'info',
      format: fileFormat,
      transports: [
        new transports.Console({
          level: 'silly',
          format: format.combine(
            format.timestamp(),
            format.colorize({ all: true }),
            format.printf(({ timestamp, level, message, context }) => {
              return `${timestamp} [${level}] [${context || 'N/A'}]: ${message}`;
            }),
          ),
        }),
        new transports.DailyRotateFile({
          filename: 'logs/error-%DATE%.log',
          level: 'error',
          datePattern: 'YYYY-MM-DD',
          maxSize: '10m',
          maxFiles: '30d',
          zippedArchive: true,
        }),
        new transports.DailyRotateFile({
          filename: 'logs/combined-%DATE%.log',
          datePattern: 'YYYY-MM-DD',
          maxSize: '20m',
          maxFiles: '14d',
          zippedArchive: true,
        }),
      ],
    });
  }

  log(message: string, context?: string): void {
    this.logger.info(message, { context });
  }

  error(message: string, context?: string, trace?: string): void {
    this.logger.error(message, { context, trace });
  }

  warn(message: string, context?: string): void {
    this.logger.warn(message, { context });
  }

  debug(message: string, context?: string): void {
    this.logger.debug(message, { context });
  }

  verbose(message: string, context?: string): void {
    this.logger.verbose(message, { context });
  }
}

import { Injectable, LoggerService } from '@nestjs/common';
import { createLogger, format, Logger, transports } from 'winston';

// Logger level: error > warn > info > http > verbose > debug > silly

@Injectable()
export class AppLogger implements LoggerService {
  private readonly logger: Logger;

  constructor() {
    this.logger = createLogger({
      level: 'info',
      format: format.combine(
        format.timestamp(),
        format.printf(({ timestamp, level, message, context }) => {
          return `${timestamp} [${level.toUpperCase()}]: { context: ${context || 'N/A'}, timestamp: ${timestamp}, message: ${message} }`;
        }),
      ),
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
        new transports.File({ filename: 'logs/error.log', level: 'error' }),
        new transports.File({ filename: 'logs/combined.log' }),
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

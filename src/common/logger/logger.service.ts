import { Injectable, LoggerService } from '@nestjs/common';
import { createLogger, format, Logger, transports } from 'winston';
import 'winston-daily-rotate-file';

@Injectable()
export class AppLogger implements LoggerService {
  private readonly logger: Logger;

  constructor() {
    const isProduction = process.env.NODE_ENV === 'production';
    const logLevel = process.env.LOG_LEVEL ?? (isProduction ? 'warn' : 'debug');

    const jsonFormat = format.combine(
      format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss.SSS' }),
      format.errors({ stack: true }),
      format.json(),
    );

    const prettyConsoleFormat = format.combine(
      format.timestamp({ format: 'HH:mm:ss.SSS' }),
      format.colorize({ all: true }),
      format.printf(({ timestamp, level, message, context, stack }) => {
        const ctx = context ? ` [${context}]` : '';
        const trace = stack ? `\n${stack}` : '';
        return `${timestamp} ${level}${ctx}: ${message}${trace}`;
      }),
    );

    const fileTransports = [
      new transports.DailyRotateFile({
        filename: 'logs/error-%DATE%.log',
        level: 'error',
        datePattern: 'YYYY-MM-DD',
        maxSize: '10m',
        maxFiles: '30d',
        zippedArchive: true,
        format: jsonFormat,
      }),
      new transports.DailyRotateFile({
        filename: 'logs/combined-%DATE%.log',
        datePattern: 'YYYY-MM-DD',
        maxSize: '20m',
        maxFiles: '14d',
        zippedArchive: true,
        format: jsonFormat,
      }),
    ];

    const consoleTransport = new transports.Console({
      format: isProduction ? jsonFormat : prettyConsoleFormat,
    });

    this.logger = createLogger({
      level: logLevel,
      transports: [consoleTransport, ...fileTransports],
      handleExceptions: true,
      handleRejections: true,
      exitOnError: false,
    });
  }

  log(message: string, context?: string): void {
    this.logger.info(message, { context });
  }

  error(message: string | Error, context?: string, trace?: string): void {
    if (message instanceof Error) {
      this.logger.error(message.message, { context, stack: message.stack });
    } else {
      this.logger.error(message, { context, ...(trace && { stack: trace }) });
    }
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

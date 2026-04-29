import 'winston-daily-rotate-file';

import { Injectable, LoggerService } from '@nestjs/common';
import { createLogger, format, Logger, transports } from 'winston';

import { getRequestContext } from '@/common/contexts/request.context';

import { ecsFormat } from './formats/ecs.format';
import { piiMaskFormat } from './formats/pii-mask.format';

export const requestContextFormat = format((info) => {
  const ctx = getRequestContext();
  if (ctx?.requestId) info.requestId = ctx.requestId;
  if (ctx?.userId !== undefined) info.userId = ctx.userId;
  return info;
});

@Injectable()
export class AppLogger implements LoggerService {
  private readonly logger: Logger;

  constructor() {
    const isProduction = process.env.NODE_ENV === 'production';
    const logLevel = process.env.LOG_LEVEL ?? (isProduction ? 'warn' : 'debug');

    const productionJsonFormat = format.combine(
      format.timestamp(),
      format.errors({ stack: true }),
      piiMaskFormat(),
      ecsFormat(),
      requestContextFormat(),
      format.json(),
    );

    const prettyConsoleFormat = format.combine(
      format.timestamp({ format: 'HH:mm:ss.SSS' }),
      format.colorize({ all: true }),
      requestContextFormat(),
      format.printf(({ timestamp, level, message, context, stack, requestId }) => {
        const ctx = context ? ` [${context}]` : '';
        const reqId = requestId ? ` (${String(requestId).slice(0, 8)})` : '';
        const trace = stack ? `\n${stack}` : '';
        return `${timestamp} ${level}${ctx}${reqId}: ${message}${trace}`;
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
        format: productionJsonFormat,
      }),
      new transports.DailyRotateFile({
        filename: 'logs/combined-%DATE%.log',
        datePattern: 'YYYY-MM-DD',
        maxSize: '20m',
        maxFiles: '14d',
        zippedArchive: true,
        format: productionJsonFormat,
      }),
    ];

    const consoleTransport = new transports.Console({
      format: isProduction ? productionJsonFormat : prettyConsoleFormat,
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

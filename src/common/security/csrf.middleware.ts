import { ForbiddenException, Injectable, NestMiddleware } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NextFunction, Request, Response } from 'express';

import { EnvironmentVariables } from '../helpers/env.validation';

const CSRF_HEADER = 'x-csrf-protection';
const CSRF_HEADER_VALUE = '1';

@Injectable()
export class CsrfMiddleware implements NestMiddleware {
  private readonly isPlaygroundEnabled: boolean;

  constructor(configService: ConfigService<EnvironmentVariables>) {
    this.isPlaygroundEnabled = configService.get('GRAPHQL_PLAYGROUND') === 'true';
  }

  use(req: Request, _res: Response, next: NextFunction) {
    if (req.method !== 'POST') {
      return next();
    }

    // Allow GraphQL playground introspection when playground is enabled
    if (this.isPlaygroundEnabled && this.isIntrospectionQuery(req)) {
      return next();
    }

    const csrfHeader = req.headers[CSRF_HEADER];

    if (csrfHeader !== CSRF_HEADER_VALUE) {
      throw new ForbiddenException('CSRF validation failed: missing or invalid x-csrf-protection header');
    }

    next();
  }

  private isIntrospectionQuery(req: Request): boolean {
    const body = req.body;

    if (!body || typeof body.query !== 'string') {
      return false;
    }

    return body.query.includes('__schema') || body.query.includes('__type');
  }
}

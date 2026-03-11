import { ForbiddenException, Injectable, NestMiddleware } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NextFunction, Request, Response } from 'express';

import { EnvironmentVariables } from '../helpers/env.validation';

import { CsrfService } from './csrf.service';

@Injectable()
export class CsrfMiddleware implements NestMiddleware {
  private readonly isPlaygroundEnabled: boolean;

  constructor(
    private readonly csrfService: CsrfService,
    configService: ConfigService<EnvironmentVariables>,
  ) {
    this.isPlaygroundEnabled = configService.get('GRAPHQL_PLAYGROUND') === 'true';
  }

  use(req: Request, res: Response, next: NextFunction) {
    // For GET requests, set a CSRF token cookie if not present
    if (req.method === 'GET') {
      if (!req.cookies?.[CsrfService.cookieName]) {
        const token = this.csrfService.generateToken();
        this.csrfService.setTokenCookie(res, token);
      }
      return next();
    }

    if (req.method !== 'POST') {
      return next();
    }

    // Allow GraphQL playground introspection when playground is enabled
    if (this.isPlaygroundEnabled && this.isIntrospectionQuery(req)) {
      return next();
    }

    const cookieToken = req.cookies?.[CsrfService.cookieName];
    const headerToken = req.headers[CsrfService.headerName] as string | undefined;

    if (!this.csrfService.validateToken(cookieToken, headerToken)) {
      throw new ForbiddenException('CSRF validation failed: missing or invalid CSRF token');
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

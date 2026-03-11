import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { randomBytes } from 'crypto';
import { CookieOptions, Response } from 'express';

import { EnvironmentVariables } from '../helpers/env.validation';

const CSRF_TOKEN_LENGTH = 32;
const CSRF_COOKIE_NAME = 'csrf-token';
const CSRF_HEADER_NAME = 'x-csrf-token';

@Injectable()
export class CsrfService {
  private readonly isProduction: boolean;
  private readonly cookieDomain?: string;

  constructor(configService: ConfigService<EnvironmentVariables>) {
    this.isProduction = configService.get('NODE_ENV') === 'production';
    this.cookieDomain = configService.get('COOKIE_DOMAIN') || undefined;
  }

  generateToken(): string {
    return randomBytes(CSRF_TOKEN_LENGTH).toString('hex');
  }

  validateToken(cookieToken: string | undefined, headerToken: string | undefined): boolean {
    if (!cookieToken || !headerToken) return false;
    if (cookieToken.length !== headerToken.length) return false;

    return cookieToken === headerToken;
  }

  setTokenCookie(res: Response, token: string): void {
    const options: CookieOptions = {
      httpOnly: false,
      secure: this.isProduction,
      sameSite: this.isProduction ? 'strict' : 'lax',
      path: '/',
      domain: this.cookieDomain,
    };

    res.cookie(CSRF_COOKIE_NAME, token, options);
  }

  static get cookieName(): string {
    return CSRF_COOKIE_NAME;
  }

  static get headerName(): string {
    return CSRF_HEADER_NAME;
  }
}

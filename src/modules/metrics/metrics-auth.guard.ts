import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { timingSafeEqual } from 'crypto';
import { Request } from 'express';

import { EnvironmentVariables } from '@/common/helpers/env.validation';

const safeEqual = (a: string, b: string): boolean => {
  const ab = Buffer.from(a);
  const bb = Buffer.from(b);
  if (ab.length !== bb.length) return false;
  return timingSafeEqual(ab, bb);
};

@Injectable()
export class MetricsAuthGuard implements CanActivate {
  constructor(private readonly configService: ConfigService<EnvironmentVariables>) {}

  canActivate(context: ExecutionContext): boolean {
    const expectedUser = this.configService.get('METRICS_USER', { infer: true });
    const expectedPassword = this.configService.get('METRICS_PASSWORD', { infer: true });

    if (!expectedUser || !expectedPassword) {
      const isProd = process.env.NODE_ENV === 'production';
      if (isProd) {
        throw new UnauthorizedException('metrics endpoint not configured');
      }
      return true;
    }

    const req = context.switchToHttp().getRequest<Request>();
    const header = req.headers.authorization;
    if (!header?.startsWith('Basic ')) {
      throw new UnauthorizedException('basic auth required');
    }

    const decoded = Buffer.from(header.slice('Basic '.length), 'base64').toString('utf8');
    const sep = decoded.indexOf(':');
    if (sep === -1) throw new UnauthorizedException('malformed credentials');

    const user = decoded.slice(0, sep);
    const password = decoded.slice(sep + 1);

    if (!safeEqual(user, expectedUser) || !safeEqual(password, expectedPassword)) {
      throw new UnauthorizedException('invalid credentials');
    }

    return true;
  }
}

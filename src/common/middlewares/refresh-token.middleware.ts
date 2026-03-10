import { Injectable, NestMiddleware } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NextFunction, Request, Response } from 'express';

import { AuthService } from '@/modules/auth/auth.service';

import { AbstractBase } from '../abstracts/base.abstract';
import { CustomUnauthorizedError } from '../exceptions/unauthorize.exception';
import { EnvironmentVariables } from '../helpers/env.validation';
import { AppLogger } from '../logger/logger.service';
import { ECookieType, EJwtErrorType } from '../enums/auth.enum';
import { UtilService } from '../utils/util.service';

@Injectable()
export class RefreshTokenMiddleware extends AbstractBase implements NestMiddleware {
  constructor(
    configService: ConfigService<EnvironmentVariables>,
    utilService: UtilService,
    appLogger: AppLogger,

    private readonly authService: AuthService,
  ) {
    super(configService, utilService, appLogger);
  }

  async use(req: Request, res: Response, next: NextFunction) {
    try {
      const { [ECookieType.ACCESS_TOKEN]: accessToken, [ECookieType.REFRESH_TOKEN]: refreshToken } =
        req.cookies || {};

      try {
        if (!accessToken && !refreshToken) {
          return next();
        }

        const user = await this.authService.validateAccessToken(accessToken);
        if (!user) {
          throw new CustomUnauthorizedError(EJwtErrorType.INVALID);
        }

        return next();
      } catch (error) {
        if (
          error instanceof Error &&
          [EJwtErrorType.EMPTY, EJwtErrorType.INVALID].includes(error.message as EJwtErrorType)
        ) {
          const user = await this.authService.validateRefreshToken(refreshToken);
          if (!user) {
            throw new CustomUnauthorizedError('Refresh token unauthorized');
          }

          const newAccessToken = this.authService.generateAccessToken(user);
          this.refreshCookie(req, res, newAccessToken);

          return next();
        }

        throw error;
      }
    } catch (error) {
      this.clearCookie(req, res);

      if (error instanceof Error && error.message) {
        throw new CustomUnauthorizedError('Unauthorized');
      }
    }
  }

  private refreshCookie(req: Request, res: Response, accessToken: string) {
    req.cookies[ECookieType.ACCESS_TOKEN] = accessToken;

    res.cookie(ECookieType.ACCESS_TOKEN, accessToken, this.authService.accessTokenCookieOptions);
  }

  private clearCookie(req: Request, res: Response) {
    req.cookies[ECookieType.ACCESS_TOKEN] = undefined;
    req.cookies[ECookieType.REFRESH_TOKEN] = undefined;

    res.clearCookie(ECookieType.ACCESS_TOKEN, {
      ...this.authService.accessTokenCookieOptions,
      maxAge: 0,
    });
    res.clearCookie(ECookieType.REFRESH_TOKEN, {
      ...this.authService.refreshTokenCookieOptions,
      maxAge: 0,
    });
  }
}

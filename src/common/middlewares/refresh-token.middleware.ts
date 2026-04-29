import { Injectable, NestMiddleware } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';

import { AuthService } from '@/modules/auth/auth.service';

import { AbstractBase } from '../abstracts/base.abstract';
import { CoreContext } from '../contexts';
import { setUserOnRequestContext } from '../contexts/request.context';
import { ECookieType, EJwtErrorType } from '../enums/auth.enum';
import { CustomUnauthorizedError } from '../exceptions/unauthorize.exception';

@Injectable()
export class RefreshTokenMiddleware extends AbstractBase implements NestMiddleware {
  constructor(
    coreContext: CoreContext,
    private readonly authService: AuthService,
  ) {
    super(coreContext);
  }

  async use(req: Request, res: Response, next: NextFunction) {
    try {
      const accessToken = this.authService.extractAccessToken(req);
      const refreshToken = this.authService.extractRefreshToken(req);

      try {
        if (!accessToken && !refreshToken) {
          return next();
        }

        const user = await this.authService.validateAccessToken(accessToken);
        if (!user) {
          throw new CustomUnauthorizedError(EJwtErrorType.INVALID);
        }

        setUserOnRequestContext(user.id);
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

          setUserOnRequestContext(user.id);
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

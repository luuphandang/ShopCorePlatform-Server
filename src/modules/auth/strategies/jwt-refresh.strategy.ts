import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Request, Response } from 'express';
import { Strategy } from 'passport-jwt';

import { CustomUnauthorizedError } from '@/common/exceptions/unauthorize.exception';
import { EnvironmentVariables } from '@/common/helpers/env.validation';
import { ECookieType } from '@/common/enums/auth.enum';
import { User } from '@/modules/users/entities/user.entity';

import { AuthService } from '../auth.service';

@Injectable()
export class JwtRefreshTokenStrategy extends PassportStrategy(Strategy, 'jwt-refresh') {
  constructor(
    private readonly configService: ConfigService<EnvironmentVariables>,
    private readonly authService: AuthService,
  ) {
    super({
      jwtFromRequest: (req: Request) => {
        const token = authService.extractRefreshToken(req);
        if (!token) throw new CustomUnauthorizedError('Refresh token not found');

        return token;
      },
      secretOrKey: configService.get('JWT_REFRESH_PRIVATE_KEY'),
      passReqToCallback: true,
    });
  }

  async validate(req: Request, res: Response): Promise<User> {
    try {
      const refreshToken = this.authService.extractRefreshToken(req);
      if (!refreshToken) throw new CustomUnauthorizedError('Refresh token not found');

      const user = await this.authService.validateRefreshToken(refreshToken);
      if (!user) throw new CustomUnauthorizedError('Refresh token invalid');

      return user;
    } catch (error) {
      res.clearCookie(ECookieType.ACCESS_TOKEN, {
        ...this.authService.accessTokenCookieOptions,
        maxAge: 0,
      });
      res.clearCookie(ECookieType.REFRESH_TOKEN, {
        ...this.authService.refreshTokenCookieOptions,
        maxAge: 0,
      });
      throw error;
    }
  }
}

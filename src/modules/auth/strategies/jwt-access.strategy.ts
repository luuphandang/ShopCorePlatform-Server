import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Request } from 'express';
import { Strategy } from 'passport-jwt';

import { CustomUnauthorizedError } from '@/common/exceptions/unauthorize.exception';
import { EnvironmentVariables } from '@/common/helpers/env.validation';
import { User } from '@/modules/users/entities/user.entity';

import { AuthService } from '../auth.service';

@Injectable()
export class JwtAccessTokenStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(
    private readonly configService: ConfigService<EnvironmentVariables>,
    private readonly authService: AuthService,
  ) {
    super({
      jwtFromRequest: (req: Request) => {
        const token = authService.extractAccessToken(req);
        if (!token) throw new CustomUnauthorizedError('Access token not found');

        return token;
      },
      secretOrKey: configService.get('JWT_ACCESS_PUBLIC_KEY'),
      passReqToCallback: true,
    });
  }

  async validate(req: Request): Promise<User> {
    const accessToken = this.authService.extractAccessToken(req);
    if (!accessToken) throw new CustomUnauthorizedError('Access token not found');

    const user = await this.authService.validateAccessToken(accessToken);
    if (!user) throw new CustomUnauthorizedError('User not found');

    return user;
  }
}

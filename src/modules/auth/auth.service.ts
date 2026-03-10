import { Injectable } from '@nestjs/common';
import { ModuleRef } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { compare } from 'bcrypt';
import { CookieOptions, Request, Response } from 'express';

import { AbstractBase } from '@/common/abstracts/base.abstract';
import { CustomBadRequestError } from '@/common/exceptions/bad-request.exception';
import { CoreContext } from '@/common/contexts';
import {
  ACCESS_TOKEN_EXPIRES_IN,
  REFRESH_TOKEN_EXPIRES_IN,
} from '@/common/constants/auth.constant';
import { ECookieType, ETokenHeader } from '@/common/enums/auth.enum';

import { User } from '../users/entities/user.entity';
import { UserService } from '../users/user.service';
import { JwtWithUser } from './entities/auth._entity';
import { SignInInput, SignUpInput } from './inputs/auth.input';

@Injectable()
export class AuthService extends AbstractBase {
  protected moduleRef: ModuleRef;
  private userService: UserService;

  constructor(
    coreContext: CoreContext,
    private readonly jwtService: JwtService,
    moduleRef: ModuleRef,
  ) {
    super(coreContext);
    this.moduleRef = moduleRef;
  }

  onModuleInit() {
    this.userService = this.moduleRef.get(UserService, { strict: false });
  }

  public async signUp(input: SignUpInput, res: Response): Promise<JwtWithUser> {
    const userExisted = await this.userService.getOne({
      where: { phone: input.phone },
    });

    if (userExisted) throw new CustomBadRequestError('Số điện thoại đã được sử dụng');

    const user = await this.userService.createUser({ ...input });

    return this.signIn(user, res);
  }

  public async signIn(user: User, res: Response): Promise<JwtWithUser> {
    const refreshToken = await this.generateRefreshToken(user.id);
    const accessToken = this.generateAccessToken(user);

    res.cookie(
      ECookieType.ACCESS_TOKEN,
      accessToken,
      this.getCookieOptions(ECookieType.ACCESS_TOKEN),
    );
    res.cookie(
      ECookieType.REFRESH_TOKEN,
      refreshToken,
      this.getCookieOptions(ECookieType.REFRESH_TOKEN),
    );

    return { access_token: accessToken, refresh_token: refreshToken, user, options: this.accessTokenCookieOptions };
  }

  public async signOut(userId: number, res: Response): Promise<void> {
    try {
      if (userId) await this.userService.updateUser(userId, { refresh_token: null });
    } catch (error) {
      this.logger.error(error, `${this.className}:signOut`);
    } finally {
      res.clearCookie(ECookieType.ACCESS_TOKEN, { ...this.accessTokenCookieOptions, maxAge: 0 });
      res.clearCookie(ECookieType.REFRESH_TOKEN, { ...this.refreshTokenCookieOptions, maxAge: 0 });
    }
  }

  public async validateUser(input: SignInInput): Promise<User> {
    const { phone, password } = input;

    const user = await this.userService.getOne({ where: { phone } });
    if (!user) return null;

    const isValid: boolean = await compare(password, user.password);
    if (!isValid) return null;

    return user;
  }

  public generateAccessToken(user: User): string {
    return this.jwtService.sign(
      { id: user.id },
      {
        secret: this.config.getString('JWT_ACCESS_PRIVATE_KEY'),
        expiresIn: `${ACCESS_TOKEN_EXPIRES_IN}s`,
      },
    );
  }

  public async validateAccessToken(accessToken: string): Promise<User> {
    const payload = this.validateJwt(accessToken, ECookieType.ACCESS_TOKEN);

    const user = await this.userService.getOne({
      where: { id: payload['id'] },
      relations: {
        roles: {
          permissions: true,
        },
      },
    });

    return user;
  }

  public get accessTokenCookieOptions(): CookieOptions {
    return this.getCookieOptions(ECookieType.ACCESS_TOKEN);
  }

  private async generateRefreshToken(userId: number): Promise<string> {
    const refreshToken = this.jwtService.sign(
      { id: userId },
      {
        secret: this.config.getString('JWT_REFRESH_PRIVATE_KEY'),
        expiresIn: `${REFRESH_TOKEN_EXPIRES_IN}s`,
      },
    );
    await this.userService.updateUser(userId, { refresh_token: refreshToken });

    return refreshToken;
  }

  public async validateRefreshToken(refreshToken: string): Promise<User> {
    const payload = this.validateJwt(refreshToken, ECookieType.REFRESH_TOKEN);

    return await this.userService.getOne({
      where: { id: payload['id'], refresh_token: refreshToken },
      relations: {
        roles: {
          permissions: true,
        },
      },
    });
  }

  public get refreshTokenCookieOptions(): CookieOptions {
    return this.getCookieOptions(ECookieType.REFRESH_TOKEN);
  }

  // Private methods

  private validateJwt(jwt: string, type: ECookieType): object {
    return this.jwtService.verify(jwt, {
      secret:
        type === ECookieType.ACCESS_TOKEN
          ? this.config.getString('JWT_ACCESS_PUBLIC_KEY')
          : this.config.getString('JWT_REFRESH_PRIVATE_KEY'),
    });
  }

  public extractAccessToken(req: Request): string | null {
    const authHeader = req.headers?.[ETokenHeader.AUTHORIZATION] as string;
    if (authHeader?.startsWith(ETokenHeader.BEARER_PREFIX)) {
      return authHeader.substring(ETokenHeader.BEARER_PREFIX.length);
    }

    return req?.cookies?.[ECookieType.ACCESS_TOKEN] || null;
  }

  public extractRefreshToken(req: Request): string | null {
    const refreshHeader = req.headers?.[ETokenHeader.REFRESH_TOKEN] as string;
    if (refreshHeader) return refreshHeader;

    return req?.cookies?.[ECookieType.REFRESH_TOKEN] || null;
  }

  private getCookieOptions(type: ECookieType): CookieOptions {
    const isProduction = this.config.getString('NODE_ENV') === 'production';
    const cookieDomain = this.config.getOptionalString('COOKIE_DOMAIN');
    const expiresIn = {
      [ECookieType.ACCESS_TOKEN]: ACCESS_TOKEN_EXPIRES_IN,
      [ECookieType.REFRESH_TOKEN]: REFRESH_TOKEN_EXPIRES_IN,
    };

    return {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? 'strict' : 'lax',
      path: '/',
      maxAge: expiresIn[type] * 1000,
      domain: cookieDomain,
    };
  }
}

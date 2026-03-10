import { UseGuards } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Args, Mutation, Resolver } from '@nestjs/graphql';
import { Response } from 'express';

import { AbstractBase } from '@/common/abstracts/base.abstract';
import { Res } from '@/common/decorators/response.decorator';
import { CurrentUser } from '@/common/decorators/user.decorator';
import { RefreshGuard } from '@/common/guards/refresh.guard';
import { SignInGuard } from '@/common/guards/signin.guard';
import { EnvironmentVariables } from '@/common/helpers/env.validation';
import { AppLogger } from '@/common/logger/logger.service';
import { ECookieType } from '@/common/enums/auth.enum';
import { UtilService } from '@/common/utils/util.service';

import { User } from '../users/entities/user.entity';
import { AuthService } from './auth.service';
import { JwtWithUser } from './entities/auth._entity';
import { SignInInput, SignUpInput } from './inputs/auth.input';

@Resolver()
export class AuthResolver extends AbstractBase {
  constructor(
    configService: ConfigService<EnvironmentVariables>,
    utilService: UtilService,
    appLogger: AppLogger,

    private readonly authService: AuthService,
  ) {
    super(configService, utilService, appLogger);
  }

  @Mutation(() => JwtWithUser)
  async signUp(@Args('data') data: SignUpInput, @Res() res: Response): Promise<JwtWithUser> {
    return await this.authService.signUp(data, res);
  }

  @Mutation(() => JwtWithUser)
  @UseGuards(SignInGuard)
  async signIn(
    @Args('data') _: SignInInput,
    @CurrentUser() user: User,
    @Res() res: Response,
  ): Promise<JwtWithUser> {
    return await this.authService.signIn(user, res);
  }

  @Mutation(() => Boolean)
  @UseGuards(RefreshGuard)
  async signOut(@CurrentUser() user: User, @Res() res: Response): Promise<boolean> {
    await this.authService.signOut(user.id, res);

    return true;
  }

  @Mutation(() => JwtWithUser)
  @UseGuards(RefreshGuard)
  async refreshToken(@CurrentUser() user: User, @Res() res: Response): Promise<JwtWithUser> {
    const accessToken = this.authService.generateAccessToken(user);
    const cookieOptions = this.authService.accessTokenCookieOptions;

    res.cookie(ECookieType.ACCESS_TOKEN, accessToken, cookieOptions);

    return { access_token: accessToken, user, options: cookieOptions };
  }
}

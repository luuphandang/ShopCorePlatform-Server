import { UseGuards } from '@nestjs/common';
import { Args, Mutation, Resolver } from '@nestjs/graphql';
import { Throttle } from '@nestjs/throttler';
import { Request, Response } from 'express';

import { AbstractBase } from '@/common/abstracts/base.abstract';
import { CoreContext } from '@/common/contexts';
import { Req } from '@/common/decorators/request.decorator';
import { Res } from '@/common/decorators/response.decorator';
import { CurrentUser } from '@/common/decorators/user.decorator';
import { RefreshGuard } from '@/common/guards/refresh.guard';
import { SignInGuard } from '@/common/guards/signin.guard';
import { ECookieType } from '@/common/enums/auth.enum';

import { User } from '../users/entities/user.entity';
import { AuthService } from './auth.service';
import { JwtWithUser } from './entities/auth._entity';
import { SignInInput, SignUpInput } from './inputs/auth.input';

@Resolver()
export class AuthResolver extends AbstractBase {
  constructor(
    coreContext: CoreContext,
    private readonly authService: AuthService,
  ) {
    super(coreContext);
  }

  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @Mutation(() => JwtWithUser)
  async signUp(@Args('data') data: SignUpInput, @Res() res: Response): Promise<JwtWithUser> {
    return await this.authService.signUp(data, res);
  }

  @Throttle({ default: { limit: 5, ttl: 60000 } })
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

  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @Mutation(() => JwtWithUser)
  @UseGuards(RefreshGuard)
  async refreshToken(
    @CurrentUser() user: User,
    @Req() req: Request,
    @Res() res: Response,
  ): Promise<JwtWithUser> {
    const accessToken = this.authService.generateAccessToken(user);
    const refreshToken = this.authService.extractRefreshToken(req);
    const cookieOptions = this.authService.accessTokenCookieOptions;

    res.cookie(ECookieType.ACCESS_TOKEN, accessToken, cookieOptions);

    return { access_token: accessToken, refresh_token: refreshToken, user, options: cookieOptions };
  }
}

import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';

import { CustomUnauthorizedError } from '@/common/exceptions/unauthorize.exception';

import { AuthService } from '../auth.service';
import { SignInInput } from '../inputs/auth.input';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy, 'local') {
  constructor(private readonly authService: AuthService) {
    super({
      usernameField: 'phone',
      passwordField: 'password',
    });
  }
  async validate(phone: string, password: string): Promise<SignInInput> {
    const user = await this.authService.validateUser({ phone, password });
    if (!user) throw new CustomUnauthorizedError('Số điện thoại hoặc mật khẩu không chính xác!');

    return user;
  }
}

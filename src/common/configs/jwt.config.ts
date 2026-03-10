import { ConfigService } from '@nestjs/config';
import { JwtModuleOptions } from '@nestjs/jwt';

import { EnvironmentVariables } from '@/common/helpers/env.validation';
import { ACCESS_TOKEN_EXPIRES_IN } from '@/common/constants/auth.constant';

export const jwtConfig = (
  configService: ConfigService<EnvironmentVariables>,
): JwtModuleOptions => ({
  publicKey: configService.get('JWT_ACCESS_PUBLIC_KEY'),
  privateKey: configService.get('JWT_ACCESS_PRIVATE_KEY'),
  signOptions: {
    algorithm: 'RS256',
    expiresIn: ACCESS_TOKEN_EXPIRES_IN,
  },
  verifyOptions: {
    algorithms: ['RS256'],
  },
});

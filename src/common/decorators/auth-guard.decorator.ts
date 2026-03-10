import { applyDecorators, SetMetadata, UseGuards } from '@nestjs/common';

import { GraphqlPassportAuthGuard } from '../guards/passport-auth.guard';

export const GUARD_ROLE = Symbol('GUARD_ROLE');

export const UseAuthGuard = (permissions?: string | string[]): MethodDecorator & ClassDecorator => {
  return applyDecorators(
    SetMetadata(
      GUARD_ROLE,
      permissions ? (Array.isArray(permissions) ? permissions : [permissions]) : [],
    ),
    UseGuards(GraphqlPassportAuthGuard),
  );
};

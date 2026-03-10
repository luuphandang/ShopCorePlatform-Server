import { ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { GqlExecutionContext } from '@nestjs/graphql';
import { AuthGuard } from '@nestjs/passport';
import { Request } from 'express';

import { User } from '@/modules/users/entities/user.entity';

import { GUARD_ROLE } from '../decorators/auth-guard.decorator';
import { CustomUnauthorizedError } from '../exceptions/unauthorize.exception';
import { ALL_USER_PERMISSIONS } from '../constants/permission.constant';

@Injectable()
export class GraphqlPassportAuthGuard extends AuthGuard('jwt') {
  constructor(private reflector: Reflector) {
    super();
  }

  getRequest(context: ExecutionContext): Request {
    const ctx = GqlExecutionContext.create(context);

    return ctx.getContext().req;
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    try {
      const requiredPermissions = this.reflector.get<string[]>(GUARD_ROLE, context.getHandler());
      await super.canActivate(context);
      const ctx = GqlExecutionContext.create(context);
      const req = ctx.getContext().req;
      const user: User = req.user;

      const permissions = new Set(ALL_USER_PERMISSIONS);
      user?.roles?.forEach((role) => {
        role?.permissions?.forEach((permission) => {
          if (permission?.value) permissions.add(permission.value);
        });
      });

      if (permissions.has('FULL_ACCESS')) return true;

      return this.hasAccess([...permissions], requiredPermissions);
    } catch (error) {
      throw new CustomUnauthorizedError(error.message);
    }
  }

  private hasAccess(permissions: string[], requiredPermissions: string[]): boolean {
    if (requiredPermissions.length === 0) return true;

    const requirePermissionSet = new Set(requiredPermissions);

    return permissions.some((permission) => requirePermissionSet.has(permission));
  }
}

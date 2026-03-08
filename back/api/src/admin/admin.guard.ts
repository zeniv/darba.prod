import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';

/** Requires req.user.roles to include 'admin' */
@Injectable()
export class AdminGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) throw new ForbiddenException('Not authenticated');

    const isAdmin =
      user.roles?.includes('admin') ||
      user.roles?.includes('realm-admin') ||
      user.isAdmin === true;

    if (!isAdmin) throw new ForbiddenException('Admin access required');
    return true;
  }
}

import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

/** Role hierarchy: admin > manager (read-only access to admin panel) */
export const ADMIN_ROLES = ['admin', 'realm-admin'] as const;
export const MANAGER_ROLES = ['manager'] as const;
export const ALL_STAFF_ROLES = [...ADMIN_ROLES, ...MANAGER_ROLES] as const;

/**
 * Decorator key — set on controller methods to restrict to admin-only
 * (managers won't be allowed). By default managers get read access.
 */
export const ADMIN_ONLY_KEY = 'adminOnly';

/** Requires req.user.roles to include 'admin' or 'manager' */
@Injectable()
export class AdminGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) throw new ForbiddenException('Not authenticated');

    const roles: string[] = user.roles || [];

    const isAdmin =
      roles.some((r) => ADMIN_ROLES.includes(r as any)) ||
      user.isAdmin === true;

    const isManager = roles.some((r) => MANAGER_ROLES.includes(r as any));

    if (!isAdmin && !isManager) {
      throw new ForbiddenException('Admin access required');
    }

    // Check if endpoint is admin-only (write operations)
    const adminOnly = this.reflector.getAllAndOverride<boolean>(ADMIN_ONLY_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (adminOnly && !isAdmin) {
      throw new ForbiddenException('Admin-only operation');
    }

    // Attach staff info to request for use in controllers
    request.staffRole = isAdmin ? 'admin' : 'manager';
    return true;
  }
}

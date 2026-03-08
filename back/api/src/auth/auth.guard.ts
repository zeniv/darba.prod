import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { IS_PUBLIC_KEY } from './public.decorator';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private jwtService: JwtService,
    private configService: ConfigService,
    private reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) return true;

    const request = context.switchToHttp().getRequest<Request>();
    const token = this.extractTokenFromHeader(request);

    if (!token) {
      throw new UnauthorizedException('No token provided');
    }

    try {
      // Keycloak JWT verification
      // В production используется JWKS endpoint Keycloak
      const keycloakUrl = this.configService.get<string>('KEYCLOAK_URL', 'http://keycloak:8080');
      const realm = this.configService.get<string>('KEYCLOAK_REALM', 'darba');

      const payload = await this.jwtService.verifyAsync(token, {
        // Keycloak public key (JWKS)
        // TODO: fetch JWKS from Keycloak and cache
        secret: this.configService.get<string>('JWT_SECRET'),
        issuer: `${keycloakUrl}/realms/${realm}`,
      });

      request['user'] = {
        keycloakId: payload.sub,
        email: payload.email,
        roles: payload.realm_access?.roles || [],
      };
    } catch {
      throw new UnauthorizedException('Invalid token');
    }

    return true;
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}

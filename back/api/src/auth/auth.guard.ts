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
import { createPublicKey } from 'crypto';
import { IS_PUBLIC_KEY } from './public.decorator';
import { UsersService } from '../users/users.service';

@Injectable()
export class AuthGuard implements CanActivate {
  private jwksCache: { pem: string; fetchedAt: number } | null = null;

  constructor(
    private jwtService: JwtService,
    private configService: ConfigService,
    private reflector: Reflector,
    private usersService: UsersService,
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
      const keycloakUrl = this.configService.get<string>('KEYCLOAK_URL', 'http://keycloak:8080');
      const realm = this.configService.get<string>('KEYCLOAK_REALM', 'darba');
      // Accept both internal Docker URL and external public URL as valid issuers
      // (KC_HOSTNAME makes Keycloak sign tokens with external issuer)
      const keycloakPublicUrl = this.configService.get<string>('KEYCLOAK_PUBLIC_URL', '');
      const issuers = [`${keycloakUrl}/realms/${realm}`];
      if (keycloakPublicUrl) {
        issuers.push(`${keycloakPublicUrl}/realms/${realm}`);
      }

      // Try JWKS verification first, fallback to JWT_SECRET
      let payload: any;
      try {
        const publicKey = await this.getKeycloakPublicKey(keycloakUrl, realm);
        payload = await this.jwtService.verifyAsync(token, {
          secret: publicKey,
          issuer: issuers,
          algorithms: ['RS256'],
        });
      } catch {
        payload = await this.jwtService.verifyAsync(token, {
          secret: this.configService.get<string>('JWT_SECRET'),
          issuer: issuers,
        });
      }

      // Resolve user from DB (find or create on first login)
      const user = await this.usersService.findOrCreate(payload.sub, payload.email);

      request['user'] = {
        userId: user.id,
        keycloakId: payload.sub,
        email: payload.email,
        roles: payload.realm_access?.roles || [],
        isAdmin: user.isAdmin,
      };
    } catch (err) {
      if (err instanceof UnauthorizedException) throw err;
      throw new UnauthorizedException('Invalid token');
    }

    return true;
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }

  /** Fetch and cache Keycloak JWKS public key (RS256), 1h TTL */
  private async getKeycloakPublicKey(url: string, realm: string): Promise<string> {
    const now = Date.now();
    if (this.jwksCache && now - this.jwksCache.fetchedAt < 3600_000) {
      return this.jwksCache.pem;
    }
    const res = await fetch(`${url}/realms/${realm}/protocol/openid-connect/certs`);
    if (!res.ok) throw new Error('Failed to fetch JWKS');
    const data = await res.json();
    const rsaKey = data.keys.find((k: any) => k.use === 'sig' && k.kty === 'RSA');
    if (!rsaKey) throw new Error('No RSA signing key in JWKS');
    const pem = createPublicKey({ key: rsaKey, format: 'jwk' })
      .export({ type: 'spki', format: 'pem' }) as string;
    this.jwksCache = { pem, fetchedAt: now };
    return pem;
  }
}

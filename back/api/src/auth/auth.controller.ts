import { Controller, Get, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Public } from './public.decorator';

export interface AuthProvider {
  alias: string;
  displayName: string;
}

@Controller('auth')
export class AuthController {
  private readonly logger = new Logger(AuthController.name);
  private cache: { providers: AuthProvider[]; fetchedAt: number } | null = null;
  private static readonly CACHE_TTL = 5 * 60_000; // 5 min

  constructor(private configService: ConfigService) {}

  /** Returns list of enabled Keycloak Identity Providers (public, no auth) */
  @Public()
  @Get('providers')
  async getProviders(): Promise<AuthProvider[]> {
    const now = Date.now();
    if (this.cache && now - this.cache.fetchedAt < AuthController.CACHE_TTL) {
      return this.cache.providers;
    }

    const keycloakUrl = this.configService.get<string>('KEYCLOAK_URL', 'http://keycloak:8080');
    const realm = this.configService.get<string>('KEYCLOAK_REALM', 'darba');

    try {
      const res = await fetch(`${keycloakUrl}/realms/${realm}`);
      if (!res.ok) throw new Error(`Keycloak ${res.status}`);
      const data = await res.json();

      const providers: AuthProvider[] = (data.identityProviders || [])
        .filter((idp: any) => idp.enabled !== false)
        .map((idp: any) => ({
          alias: idp.alias,
          displayName: idp.displayName || idp.alias,
        }));

      this.cache = { providers, fetchedAt: now };
      return providers;
    } catch (err) {
      this.logger.error('Failed to fetch Keycloak IdPs', err);
      // Return cached if available, otherwise empty
      return this.cache?.providers || [];
    }
  }
}

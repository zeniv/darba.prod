import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { IntegrationsService } from './integrations.service';

interface OAuthTokens {
  accessToken: string;
  refreshToken?: string;
  expiresIn?: number;
}

@Injectable()
export class SocialOAuthService {
  private readonly logger = new Logger(SocialOAuthService.name);

  constructor(
    private prisma: PrismaService,
    private config: ConfigService,
    private integrations: IntegrationsService,
  ) {}

  /** Get VK OAuth authorization URL */
  getVkAuthUrl(redirectUri: string, state: string): string {
    const clientId = this.config.get('VK_CLIENT_ID', '');
    return (
      `https://oauth.vk.com/authorize?client_id=${clientId}`
      + `&redirect_uri=${encodeURIComponent(redirectUri)}`
      + `&display=page&scope=wall,photos&response_type=code`
      + `&state=${state}`
    );
  }

  /** Exchange VK auth code for tokens */
  async exchangeVkCode(code: string, redirectUri: string): Promise<OAuthTokens> {
    const clientId = this.config.get('VK_CLIENT_ID', '');
    const clientSecret = this.config.get('VK_CLIENT_SECRET', '');

    const res = await fetch(
      `https://oauth.vk.com/access_token?client_id=${clientId}`
      + `&client_secret=${clientSecret}`
      + `&redirect_uri=${encodeURIComponent(redirectUri)}`
      + `&code=${code}`,
    );
    const data = await res.json();

    return {
      accessToken: data.access_token,
      expiresIn: data.expires_in,
    };
  }

  /** Save social connection */
  async saveConnection(
    userId: string,
    provider: string,
    tokens: OAuthTokens,
    metadata?: Record<string, any>,
  ) {
    const encryptedAccess = this.integrations.encrypt(tokens.accessToken);
    const encryptedRefresh = tokens.refreshToken
      ? this.integrations.encrypt(tokens.refreshToken)
      : undefined;

    return this.prisma.userIntegration.upsert({
      where: { userId_type_provider: { userId, type: 'social', provider } },
      update: {
        encryptedKey: encryptedAccess,
        metadata: { ...metadata, refreshToken: encryptedRefresh },
        isActive: true,
      },
      create: {
        userId,
        type: 'social',
        provider,
        encryptedKey: encryptedAccess,
        metadata: { ...metadata, refreshToken: encryptedRefresh },
      },
    });
  }

  /** Get user's connected social accounts */
  async getConnections(userId: string) {
    return this.prisma.userIntegration.findMany({
      where: { userId, type: 'social' },
      select: {
        id: true,
        provider: true,
        isActive: true,
        createdAt: true,
      },
    });
  }

  /** Disconnect social account */
  async disconnect(userId: string, provider: string) {
    await this.prisma.userIntegration.deleteMany({
      where: { userId, type: 'social', provider },
    });
    return { ok: true };
  }
}

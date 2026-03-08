import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { TelegramService } from '../telegram/telegram.service';

/**
 * Admin settings for platform-wide configuration.
 * Settings stored as key-value in DB or env vars.
 */
@Injectable()
export class AdminSettingsService {
  constructor(
    private prisma: PrismaService,
    private telegram: TelegramService,
  ) {}

  /** Set up Telegram webhook */
  async setupTelegramWebhook(webhookUrl: string) {
    return this.telegram.setWebhook(webhookUrl);
  }

  /** Get MCP server configs (stored as JSON in admin settings) */
  async getMcpConfigs() {
    // MCP servers configured per-instance
    // For MVP, return placeholder
    return {
      servers: [],
      note: 'MCP servers are configured via environment variables and admin panel',
    };
  }

  /** Get marketing settings */
  async getMarketingSettings() {
    return {
      googleAnalyticsId: '',
      facebookPixelId: '',
      yandexMetrikaId: '',
      utmTracking: true,
    };
  }
}

import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { IntegrationsService } from './integrations.service';

const TG_API = 'https://api.telegram.org/bot';

export interface TgPostResult {
  ok: boolean;
  messageId?: number;
  error?: string;
}

interface TgChannelConfig {
  botToken: string;
  channelId: string;
}

@Injectable()
export class TelegramPostingService {
  private readonly logger = new Logger(TelegramPostingService.name);

  constructor(
    private prisma: PrismaService,
    private integrations: IntegrationsService,
  ) {}

  /** Post text message to user's Telegram channel */
  async postToChannel(
    userId: string,
    text: string,
    imageUrl?: string,
  ): Promise<TgPostResult> {
    const config = await this.getChannelConfig(userId);
    if (!config) {
      return { ok: false, error: 'Telegram channel not connected' };
    }

    try {
      if (imageUrl) {
        return this.sendPhoto(config, imageUrl, text);
      }
      return this.sendMessage(config, text);
    } catch (err) {
      this.logger.error(`Telegram posting error: ${err}`);
      return { ok: false, error: 'Telegram API request failed' };
    }
  }

  /** Test connection by sending a test message */
  async testConnection(botToken: string, channelId: string): Promise<TgPostResult> {
    try {
      // First check bot token is valid
      const meRes = await fetch(`${TG_API}${botToken}/getMe`);
      const meData = await meRes.json();
      if (!meData.ok) {
        return { ok: false, error: 'Invalid bot token' };
      }

      // Try sending a test message
      const res = await fetch(`${TG_API}${botToken}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: channelId,
          text: 'Darba: Telegram channel connected successfully!',
        }),
      });
      const data = await res.json();

      if (!data.ok) {
        return { ok: false, error: data.description || 'Failed to send message' };
      }

      return { ok: true, messageId: data.result.message_id };
    } catch {
      return { ok: false, error: 'Connection test failed' };
    }
  }

  /** Check if user has configured Telegram channel */
  async isConnected(userId: string): Promise<boolean> {
    return !!(await this.getChannelConfig(userId));
  }

  /** Save channel config for user (bot token encrypted at rest) */
  async saveConfig(userId: string, botToken: string, channelId: string) {
    const encrypted = this.integrations.encrypt(botToken);
    return this.prisma.userIntegration.upsert({
      where: { userId_type_provider: { userId, type: 'social', provider: 'telegram_channel' } },
      update: {
        encryptedKey: encrypted,
        metadata: { channelId },
        isActive: true,
      },
      create: {
        userId,
        type: 'social',
        provider: 'telegram_channel',
        encryptedKey: encrypted,
        metadata: { channelId },
      },
    });
  }

  /** Remove channel config */
  async removeConfig(userId: string) {
    await this.prisma.userIntegration.deleteMany({
      where: { userId, type: 'social', provider: 'telegram_channel' },
    });
    return { ok: true };
  }

  private async sendMessage(config: TgChannelConfig, text: string): Promise<TgPostResult> {
    const res = await fetch(`${TG_API}${config.botToken}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: config.channelId,
        text,
        parse_mode: 'HTML',
      }),
    });
    const data = await res.json();

    if (!data.ok) {
      this.logger.warn(`Telegram sendMessage failed: ${data.description}`);
      return { ok: false, error: data.description };
    }

    this.logger.log(`Telegram channel post: messageId=${data.result.message_id}`);
    return { ok: true, messageId: data.result.message_id };
  }

  private async sendPhoto(config: TgChannelConfig, photoUrl: string, caption: string): Promise<TgPostResult> {
    const res = await fetch(`${TG_API}${config.botToken}/sendPhoto`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: config.channelId,
        photo: photoUrl,
        caption: caption.slice(0, 1024), // Telegram caption limit
        parse_mode: 'HTML',
      }),
    });
    const data = await res.json();

    if (!data.ok) {
      this.logger.warn(`Telegram sendPhoto failed: ${data.description}`);
      return { ok: false, error: data.description };
    }

    return { ok: true, messageId: data.result.message_id };
  }

  private async getChannelConfig(userId: string): Promise<TgChannelConfig | null> {
    const integration = await this.prisma.userIntegration.findUnique({
      where: { userId_type_provider: { userId, type: 'social', provider: 'telegram_channel' } },
    });
    if (!integration?.isActive || !integration.encryptedKey) return null;

    const metadata = integration.metadata as any;
    let botToken: string;
    try {
      botToken = this.integrations.decrypt(integration.encryptedKey);
    } catch {
      // Fallback for unencrypted legacy tokens
      botToken = integration.encryptedKey;
    }
    return { botToken, channelId: metadata?.channelId };
  }
}

import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class TelegramService {
  private readonly logger = new Logger(TelegramService.name);
  private readonly botToken: string;
  private readonly apiUrl: string;

  constructor(private config: ConfigService) {
    this.botToken = this.config.get('TELEGRAM_BOT_TOKEN', '');
    this.apiUrl = `https://api.telegram.org/bot${this.botToken}`;
  }

  /** Send a message to a Telegram chat */
  async sendMessage(chatId: string | number, text: string, parseMode: string = 'HTML') {
    if (!this.botToken) {
      this.logger.warn('Telegram bot token not configured');
      return;
    }

    try {
      const res = await fetch(`${this.apiUrl}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: chatId,
          text,
          parse_mode: parseMode,
        }),
      });

      if (!res.ok) {
        const err = await res.text();
        this.logger.error(`Telegram sendMessage error: ${err}`);
      }
    } catch (e) {
      this.logger.error(`Telegram sendMessage failed: ${e}`);
    }
  }

  /** Send notification to user (if they have telegram linked) */
  async notifyUser(telegramChatId: string, title: string, body?: string) {
    const text = body ? `<b>${title}</b>\n${body}` : `<b>${title}</b>`;
    return this.sendMessage(telegramChatId, text);
  }

  /** Process incoming webhook update from Telegram */
  async handleUpdate(update: any) {
    const message = update.message;
    if (!message?.text) return;

    const chatId = message.chat.id;
    const text = message.text;

    if (text === '/start') {
      const linkCode = text.split(' ')[1];
      if (linkCode) {
        // User is linking their account
        return this.sendMessage(
          chatId,
          '✅ Аккаунт успешно привязан! Вы будете получать уведомления в этот чат.',
        );
      }
      return this.sendMessage(
        chatId,
        '👋 Привет! Я бот <b>Darba AI Studio</b>.\n\n'
        + 'Привяжите аккаунт в настройках профиля, чтобы получать уведомления.\n\n'
        + 'Команды:\n'
        + '/help — помощь\n'
        + '/status — статус AI-задач',
      );
    }

    if (text === '/help') {
      return this.sendMessage(
        chatId,
        '📖 <b>Команды:</b>\n'
        + '/start — начать\n'
        + '/status — статус ваших AI-задач\n'
        + '/balance — баланс токенов\n'
        + '/help — эта справка',
      );
    }

    // Default response
    return this.sendMessage(
      chatId,
      'Используйте /help для списка команд.',
    );
  }

  /** Set webhook URL for Telegram */
  async setWebhook(url: string) {
    if (!this.botToken) return;

    const res = await fetch(`${this.apiUrl}/setWebhook`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url }),
    });

    const data = await res.json();
    this.logger.log(`Telegram setWebhook: ${JSON.stringify(data)}`);
    return data;
  }
}

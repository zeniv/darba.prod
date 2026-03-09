import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createTransport, Transporter } from 'nodemailer';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private transporter: Transporter | null = null;
  private readonly from: string;

  constructor(private config: ConfigService) {
    this.from = this.config.get('EMAIL_FROM', 'noreply@darba.pro');
    const host = this.config.get('SMTP_HOST');
    if (host) {
      this.transporter = createTransport({
        host,
        port: parseInt(this.config.get('SMTP_PORT', '587'), 10),
        secure: false,
        auth: {
          user: this.config.get('SMTP_USER'),
          pass: this.config.get('SMTP_PASSWORD'),
        },
      });
      this.logger.log(`SMTP configured: ${host}`);
    } else {
      this.logger.warn('SMTP not configured — emails will be logged only');
    }
  }

  async send(to: string, subject: string, html: string): Promise<boolean> {
    if (!this.transporter) {
      this.logger.log(`[EMAIL-DRY] To: ${to} | Subject: ${subject}`);
      return false;
    }
    try {
      await this.transporter.sendMail({ from: this.from, to, subject, html });
      this.logger.log(`Email sent to ${to}: ${subject}`);
      return true;
    } catch (err) {
      this.logger.error(`Email to ${to} failed: ${err}`);
      return false;
    }
  }

  async sendWelcome(to: string, name: string) {
    return this.send(
      to,
      'Добро пожаловать в Darba AI Studio!',
      `<h2>Привет, ${name}!</h2><p>Ваш аккаунт создан. Начните использовать AI-агенты прямо сейчас.</p><p><a href="https://darba.pro">Перейти в Darba</a></p>`,
    );
  }

  async sendPaymentSuccess(to: string, planName: string, amount: string) {
    return this.send(
      to,
      `Оплата подтверждена — ${planName}`,
      `<h2>Оплата прошла успешно!</h2><p>Тариф: <b>${planName}</b><br>Сумма: ${amount}</p><p><a href="https://darba.pro/profile">Мой профиль</a></p>`,
    );
  }

  async sendAiTaskDone(to: string, agentType: string) {
    return this.send(
      to,
      'AI-задача завершена',
      `<p>Задача <b>${agentType}</b> успешно выполнена.</p><p><a href="https://darba.pro">Посмотреть результат</a></p>`,
    );
  }
}

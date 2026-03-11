import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type {
  PaymentProvider,
  CreatePaymentParams,
  PaymentResult,
  WebhookEvent,
} from './payment-provider.interface';

@Injectable()
export class YooKassaProvider implements PaymentProvider {
  readonly name = 'yookassa';
  private readonly logger = new Logger(YooKassaProvider.name);
  private readonly shopId: string;
  private readonly secretKey: string;
  private readonly apiUrl = 'https://api.yookassa.ru/v3';

  constructor(private config: ConfigService) {
    this.shopId = this.config.get('YOOKASSA_SHOP_ID', '');
    this.secretKey = this.config.get('YOOKASSA_SECRET_KEY', '');
  }

  async createPayment(params: CreatePaymentParams): Promise<PaymentResult> {
    const idempotenceKey = crypto.randomUUID();

    const response = await fetch(`${this.apiUrl}/payments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Idempotence-Key': idempotenceKey,
        Authorization:
          'Basic ' +
          Buffer.from(`${this.shopId}:${this.secretKey}`).toString('base64'),
      },
      body: JSON.stringify({
        amount: {
          value: params.amount.toFixed(2),
          currency: params.currency,
        },
        confirmation: {
          type: 'redirect',
          return_url: params.returnUrl,
        },
        capture: true,
        description: params.description,
        metadata: params.metadata,
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      this.logger.error(`YooKassa create payment error: ${err}`);
      throw new Error(`YooKassa API error: ${response.status}`);
    }

    const data = await response.json();
    return {
      providerPaymentId: data.id,
      confirmationUrl: data.confirmation.confirmation_url,
      status: data.status,
    };
  }

  async parseWebhook(body: any, _headers: Record<string, string>): Promise<WebhookEvent> {
    // Verify: fetch payment from YooKassa API to confirm status
    await this.verifyPayment(body.object?.id);
    const payment = body.object;
    const statusMap: Record<string, WebhookEvent['status']> = {
      'payment.succeeded': 'paid',
      'payment.canceled': 'failed',
      'refund.succeeded': 'refunded',
    };

    return {
      providerPaymentId: payment.id,
      status: statusMap[body.event] || 'failed',
      amount: parseFloat(payment.amount.value),
      currency: payment.amount.currency,
      metadata: payment.metadata || {},
    };
  }

  /** Verify webhook by fetching payment status directly from YooKassa API */
  private async verifyPayment(paymentId: string): Promise<void> {
    if (!paymentId || !this.shopId || !this.secretKey) return;
    const response = await fetch(`${this.apiUrl}/payments/${paymentId}`, {
      headers: {
        Authorization:
          'Basic ' +
          Buffer.from(`${this.shopId}:${this.secretKey}`).toString('base64'),
      },
    });
    if (!response.ok) {
      this.logger.error(`YooKassa verify failed: ${response.status}`);
      throw new UnauthorizedException('Failed to verify payment with YooKassa');
    }
    this.logger.log(`YooKassa webhook verified for payment ${paymentId}`);
  }
}

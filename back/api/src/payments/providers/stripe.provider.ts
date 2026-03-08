import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type {
  PaymentProvider,
  CreatePaymentParams,
  PaymentResult,
  WebhookEvent,
} from './payment-provider.interface';

@Injectable()
export class StripeProvider implements PaymentProvider {
  readonly name = 'stripe';
  private readonly logger = new Logger(StripeProvider.name);
  private readonly secretKey: string;
  private readonly webhookSecret: string;
  private readonly apiUrl = 'https://api.stripe.com/v1';

  constructor(private config: ConfigService) {
    this.secretKey = this.config.get('STRIPE_SECRET_KEY', '');
    this.webhookSecret = this.config.get('STRIPE_WEBHOOK_SECRET', '');
  }

  async createPayment(params: CreatePaymentParams): Promise<PaymentResult> {
    // Stripe Checkout Session
    const body = new URLSearchParams();
    body.append('mode', 'payment');
    body.append('success_url', params.returnUrl + '?status=success');
    body.append('cancel_url', params.returnUrl + '?status=cancel');
    body.append('line_items[0][price_data][currency]', params.currency.toLowerCase());
    body.append(
      'line_items[0][price_data][unit_amount]',
      Math.round(params.amount * 100).toString(),
    );
    body.append('line_items[0][price_data][product_data][name]', params.description);
    body.append('line_items[0][quantity]', '1');

    for (const [k, v] of Object.entries(params.metadata)) {
      body.append(`metadata[${k}]`, v);
    }

    const response = await fetch(`${this.apiUrl}/checkout/sessions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Authorization: `Bearer ${this.secretKey}`,
      },
      body: body.toString(),
    });

    if (!response.ok) {
      const err = await response.text();
      this.logger.error(`Stripe create session error: ${err}`);
      throw new Error(`Stripe API error: ${response.status}`);
    }

    const data = await response.json();
    return {
      providerPaymentId: data.id,
      confirmationUrl: data.url,
      status: data.status,
    };
  }

  async parseWebhook(body: any, headers: Record<string, string>): Promise<WebhookEvent> {
    // TODO: Verify webhook signature using this.webhookSecret + headers['stripe-signature']
    const event = body;
    const obj = event.data?.object;

    const statusMap: Record<string, WebhookEvent['status']> = {
      'checkout.session.completed': 'paid',
      'payment_intent.payment_failed': 'failed',
      'charge.refunded': 'refunded',
    };

    return {
      providerPaymentId: obj?.id || '',
      status: statusMap[event.type] || 'failed',
      amount: (obj?.amount_total || 0) / 100,
      currency: (obj?.currency || 'usd').toUpperCase(),
      metadata: obj?.metadata || {},
    };
  }
}

export interface CreatePaymentParams {
  amount: number;
  currency: string;
  description: string;
  returnUrl: string;
  metadata: Record<string, string>;
}

export interface PaymentResult {
  providerPaymentId: string;
  confirmationUrl: string;
  status: string;
}

export interface WebhookEvent {
  providerPaymentId: string;
  status: 'paid' | 'failed' | 'refunded';
  amount: number;
  currency: string;
  metadata: Record<string, string>;
}

export interface PaymentProvider {
  readonly name: string;

  createPayment(params: CreatePaymentParams): Promise<PaymentResult>;

  parseWebhook(body: any, headers: Record<string, string>): Promise<WebhookEvent>;
}

import {
  Injectable,
  BadRequestException,
  NotFoundException,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { PlansService } from '../plans/plans.service';
import { YooKassaProvider } from './providers/yookassa.provider';
import { StripeProvider } from './providers/stripe.provider';
import type { PaymentProvider, WebhookEvent } from './providers/payment-provider.interface';

@Injectable()
export class PaymentsService {
  private readonly logger = new Logger(PaymentsService.name);
  private providers: Map<string, PaymentProvider>;

  constructor(
    private prisma: PrismaService,
    private plansService: PlansService,
    private config: ConfigService,
    private yookassa: YooKassaProvider,
    private stripe: StripeProvider,
  ) {
    this.providers = new Map<string, PaymentProvider>([
      ['yookassa', this.yookassa],
      ['stripe', this.stripe],
    ]);
  }

  /** Create a payment and redirect user to provider checkout */
  async createPayment(
    userId: string,
    planId: string,
    providerName: string = 'yookassa',
    returnUrl?: string,
  ) {
    const plan = await this.plansService.findById(planId);
    if (Number(plan.price) === 0) {
      throw new BadRequestException('Free plan does not require payment');
    }

    const provider = this.providers.get(providerName);
    if (!provider) {
      throw new BadRequestException(`Unknown payment provider: ${providerName}`);
    }

    // Create DB record
    const payment = await this.prisma.payment.create({
      data: {
        userId,
        planId,
        amount: plan.price,
        currency: plan.currency,
        provider: providerName,
        status: 'pending',
      },
    });

    // Call provider
    const appUrl = this.config.get('APP_URL', 'http://localhost:3000');
    const result = await provider.createPayment({
      amount: Number(plan.price),
      currency: plan.currency,
      description: `Darba — ${plan.displayName}`,
      returnUrl: returnUrl || `${appUrl}/profile/payment?paymentId=${payment.id}`,
      metadata: {
        paymentId: payment.id,
        userId,
        planId,
      },
    });

    // Update with provider ID
    await this.prisma.payment.update({
      where: { id: payment.id },
      data: { providerPaymentId: result.providerPaymentId },
    });

    return {
      paymentId: payment.id,
      confirmationUrl: result.confirmationUrl,
    };
  }

  /** Handle webhook from payment provider */
  async handleWebhook(
    providerName: string,
    body: any,
    headers: Record<string, string>,
  ) {
    const provider = this.providers.get(providerName);
    if (!provider) {
      throw new BadRequestException(`Unknown provider: ${providerName}`);
    }

    const event: WebhookEvent = await provider.parseWebhook(body, headers);

    // Find payment by provider ID
    const payment = await this.prisma.payment.findFirst({
      where: { providerPaymentId: event.providerPaymentId },
      include: { plan: true },
    });

    if (!payment) {
      this.logger.warn(
        `Webhook: payment not found for providerPaymentId=${event.providerPaymentId}`,
      );
      return { received: true };
    }

    // Skip if already processed
    if (payment.status === event.status) {
      return { received: true };
    }

    await this.prisma.payment.update({
      where: { id: payment.id },
      data: { status: event.status },
    });

    if (event.status === 'paid') {
      await this.activatePlan(payment.userId, payment.planId, payment.plan.tokens);
    }

    return { received: true };
  }

  /** Activate plan for user after successful payment */
  private async activatePlan(userId: string, planId: string, tokens: number) {
    const expiresAt = new Date();
    expiresAt.setMonth(expiresAt.getMonth() + 1);

    await this.prisma.user.update({
      where: { id: userId },
      data: {
        planId,
        planExpiry: expiresAt,
        tokenBalance: { increment: tokens },
      },
    });

    this.logger.log(`Plan activated: userId=${userId}, planId=${planId}, +${tokens} tokens`);
  }

  /** Switch to free plan */
  async switchToFree(userId: string) {
    const freePlan = await this.plansService.findByName('Free');
    if (!freePlan) throw new NotFoundException('Free plan not configured');

    await this.prisma.user.update({
      where: { id: userId },
      data: {
        planId: freePlan.id,
        planExpiry: null,
      },
    });
  }

  /** Get user payment history */
  async getHistory(userId: string, take = 50) {
    return this.prisma.payment.findMany({
      where: { userId },
      include: { plan: true },
      orderBy: { createdAt: 'desc' },
      take,
    });
  }

  /** Get single payment */
  async getPayment(paymentId: string) {
    const payment = await this.prisma.payment.findUnique({
      where: { id: paymentId },
      include: { plan: true },
    });
    if (!payment) throw new NotFoundException('Payment not found');
    return payment;
  }
}

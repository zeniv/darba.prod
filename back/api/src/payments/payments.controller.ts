import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  Req,
  Headers,
  RawBodyRequest,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { PaymentsService } from './payments.service';
import { TokenService } from './token.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { Public } from '../auth/public.decorator';

@ApiTags('Payments')
@Controller('payments')
export class PaymentsController {
  constructor(
    private paymentsService: PaymentsService,
    private tokenService: TokenService,
  ) {}

  @Post()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Создать платёж (перенаправление на оплату)' })
  async create(@Req() req: any, @Body() dto: CreatePaymentDto) {
    const user = req.user;
    return this.paymentsService.createPayment(
      user.userId,
      dto.planId,
      dto.provider || 'yookassa',
      dto.returnUrl,
    );
  }

  @Get('history')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'История платежей' })
  async history(@Req() req: any) {
    return this.paymentsService.getHistory(req.user.userId);
  }

  @Get('balance')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Баланс токенов' })
  async balance(@Req() req: any) {
    const balance = await this.tokenService.getBalance(req.user.userId);
    return { balance };
  }

  @Get(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Детали платежа' })
  async getPayment(@Param('id') id: string) {
    return this.paymentsService.getPayment(id);
  }

  // ── Webhooks (public, no JWT) ──

  @Post('webhook/yookassa')
  @Public()
  @ApiOperation({ summary: 'Webhook ЮКасса' })
  async webhookYookassa(@Body() body: any, @Headers() headers: Record<string, string>) {
    return this.paymentsService.handleWebhook('yookassa', body, headers);
  }

  @Post('webhook/stripe')
  @Public()
  @ApiOperation({ summary: 'Webhook Stripe' })
  async webhookStripe(@Body() body: any, @Headers() headers: Record<string, string>) {
    return this.paymentsService.handleWebhook('stripe', body, headers);
  }
}

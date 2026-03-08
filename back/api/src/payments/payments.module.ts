import { Module } from '@nestjs/common';
import { PaymentsController } from './payments.controller';
import { PaymentsService } from './payments.service';
import { TokenService } from './token.service';
import { YooKassaProvider } from './providers/yookassa.provider';
import { StripeProvider } from './providers/stripe.provider';
import { PlansModule } from '../plans/plans.module';

@Module({
  imports: [PlansModule],
  controllers: [PaymentsController],
  providers: [PaymentsService, TokenService, YooKassaProvider, StripeProvider],
  exports: [PaymentsService, TokenService],
})
export class PaymentsModule {}

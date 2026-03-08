import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { AiGatewayController } from './ai-gateway.controller';
import { AiGatewayService } from './ai-gateway.service';
import { PaymentsModule } from '../payments/payments.module';
import { IntegrationsModule } from '../integrations/integrations.module';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [
    BullModule.registerQueue({ name: 'ai-tasks' }),
    PaymentsModule,
    IntegrationsModule,
    NotificationsModule,
  ],
  controllers: [AiGatewayController],
  providers: [AiGatewayService],
  exports: [AiGatewayService],
})
export class AiGatewayModule {}

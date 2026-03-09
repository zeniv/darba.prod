import { Module } from '@nestjs/common';
import { IntegrationsController } from './integrations.controller';
import { IntegrationsService } from './integrations.service';
import { SocialOAuthController } from './social-oauth.controller';
import { SocialOAuthService } from './social-oauth.service';
import { VkPostingService } from './vk-posting.service';
import { TelegramPostingService } from './telegram-posting.service';

@Module({
  controllers: [IntegrationsController, SocialOAuthController],
  providers: [IntegrationsService, SocialOAuthService, VkPostingService, TelegramPostingService],
  exports: [IntegrationsService, SocialOAuthService, VkPostingService, TelegramPostingService],
})
export class IntegrationsModule {}

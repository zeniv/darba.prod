import { Module } from '@nestjs/common';
import { IntegrationsController } from './integrations.controller';
import { IntegrationsService } from './integrations.service';
import { SocialOAuthController } from './social-oauth.controller';
import { SocialOAuthService } from './social-oauth.service';
import { VkPostingService } from './vk-posting.service';

@Module({
  controllers: [IntegrationsController, SocialOAuthController],
  providers: [IntegrationsService, SocialOAuthService, VkPostingService],
  exports: [IntegrationsService, SocialOAuthService, VkPostingService],
})
export class IntegrationsModule {}

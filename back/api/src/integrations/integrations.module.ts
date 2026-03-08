import { Module } from '@nestjs/common';
import { IntegrationsController } from './integrations.controller';
import { IntegrationsService } from './integrations.service';
import { SocialOAuthController } from './social-oauth.controller';
import { SocialOAuthService } from './social-oauth.service';

@Module({
  controllers: [IntegrationsController, SocialOAuthController],
  providers: [IntegrationsService, SocialOAuthService],
  exports: [IntegrationsService, SocialOAuthService],
})
export class IntegrationsModule {}

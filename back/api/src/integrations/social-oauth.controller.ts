import { Controller, Get, Post, Delete, Query, Param, Req } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { SocialOAuthService } from './social-oauth.service';
import { ConfigService } from '@nestjs/config';

@ApiTags('Social OAuth')
@Controller('oauth')
@ApiBearerAuth()
export class SocialOAuthController {
  constructor(
    private socialOAuth: SocialOAuthService,
    private config: ConfigService,
  ) {}

  @Get('vk/url')
  @ApiOperation({ summary: 'Получить VK OAuth URL' })
  getVkUrl(@Req() req: any) {
    const appUrl = this.config.get('APP_URL', 'http://localhost:3000');
    const redirectUri = `${appUrl}/api/oauth/vk/callback`;
    const state = req.user.userId;
    return { url: this.socialOAuth.getVkAuthUrl(redirectUri, state) };
  }

  @Get('vk/callback')
  @ApiOperation({ summary: 'VK OAuth callback' })
  async vkCallback(@Query('code') code: string, @Query('state') userId: string) {
    const appUrl = this.config.get('APP_URL', 'http://localhost:3000');
    const redirectUri = `${appUrl}/api/oauth/vk/callback`;
    const tokens = await this.socialOAuth.exchangeVkCode(code, redirectUri);
    await this.socialOAuth.saveConnection(userId, 'vk', tokens);
    return { ok: true, provider: 'vk' };
  }

  @Get('connections')
  @ApiOperation({ summary: 'Мои соцсети' })
  async connections(@Req() req: any) {
    return this.socialOAuth.getConnections(req.user.userId);
  }

  @Delete(':provider')
  @ApiOperation({ summary: 'Отключить соцсеть' })
  async disconnect(@Param('provider') provider: string, @Req() req: any) {
    return this.socialOAuth.disconnect(req.user.userId, provider);
  }
}

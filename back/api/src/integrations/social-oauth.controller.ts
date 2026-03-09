import { Controller, Get, Post, Delete, Query, Param, Req, Body } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { SocialOAuthService } from './social-oauth.service';
import { TelegramPostingService } from './telegram-posting.service';
import { ConfigService } from '@nestjs/config';

@ApiTags('Social OAuth')
@Controller('oauth')
@ApiBearerAuth()
export class SocialOAuthController {
  constructor(
    private socialOAuth: SocialOAuthService,
    private tgPosting: TelegramPostingService,
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
    if (provider === 'telegram_channel') {
      return this.tgPosting.removeConfig(req.user.userId);
    }
    return this.socialOAuth.disconnect(req.user.userId, provider);
  }

  // --- Telegram Channel ---

  @Post('telegram-channel')
  @ApiOperation({ summary: 'Подключить Telegram-канал' })
  async connectTelegramChannel(
    @Req() req: any,
    @Body() body: { botToken: string; channelId: string },
  ) {
    await this.tgPosting.saveConfig(req.user.userId, body.botToken, body.channelId);
    return { ok: true, provider: 'telegram_channel' };
  }

  @Post('telegram-channel/test')
  @ApiOperation({ summary: 'Тест подключения Telegram-канала' })
  async testTelegramChannel(@Body() body: { botToken: string; channelId: string }) {
    return this.tgPosting.testConnection(body.botToken, body.channelId);
  }
}

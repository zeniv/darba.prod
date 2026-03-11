import { Controller, Post, Body } from '@nestjs/common';
import { ApiTags, ApiExcludeEndpoint } from '@nestjs/swagger';
import { TelegramService } from './telegram.service';
import { Public } from '../auth/public.decorator';

@ApiTags('Telegram')
@Controller('telegram')
export class TelegramController {
  constructor(private telegramService: TelegramService) {}

  @Post('webhook')
  @Public()
  @ApiExcludeEndpoint()
  async webhook(@Body() update: any) {
    await this.telegramService.handleUpdate(update);
    return { ok: true };
  }
}

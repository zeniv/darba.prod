import { Controller, Get, Post, Param, Req } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { NotificationsService } from './notifications.service';

@ApiTags('Notifications')
@Controller('notifications')
@ApiBearerAuth()
export class NotificationsController {
  constructor(private notificationsService: NotificationsService) {}

  @Get()
  @ApiOperation({ summary: 'Мои уведомления' })
  async list(@Req() req: any) {
    return this.notificationsService.getUserNotifications(req.user.userId);
  }

  @Get('unread-count')
  @ApiOperation({ summary: 'Количество непрочитанных' })
  async unreadCount(@Req() req: any) {
    const count = await this.notificationsService.unreadCount(req.user.userId);
    return { count };
  }

  @Post(':id/read')
  @ApiOperation({ summary: 'Пометить прочитанным' })
  async markRead(@Param('id') id: string, @Req() req: any) {
    await this.notificationsService.markRead(req.user.userId, id);
    return { ok: true };
  }

  @Post('read-all')
  @ApiOperation({ summary: 'Пометить все прочитанными' })
  async markAllRead(@Req() req: any) {
    await this.notificationsService.markAllRead(req.user.userId);
    return { ok: true };
  }
}

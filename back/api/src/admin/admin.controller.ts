import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { AdminGuard } from './admin.guard';
import { AdminUsersService } from './admin-users.service';
import { AdminSupportService } from './admin-support.service';
import { AdminCmsService } from './admin-cms.service';
import { AdminSettingsService } from './admin-settings.service';

@ApiTags('Admin')
@Controller('admin')
@ApiBearerAuth()
@UseGuards(AdminGuard)
export class AdminController {
  constructor(
    private adminUsers: AdminUsersService,
    private adminSupport: AdminSupportService,
    private adminCms: AdminCmsService,
    private adminSettings: AdminSettingsService,
  ) {}

  // ── Dashboard ──

  @Get('stats')
  @ApiOperation({ summary: 'Статистика платформы' })
  async stats() {
    return this.adminUsers.stats();
  }

  // ── Users ──

  @Get('users')
  @ApiOperation({ summary: 'Список пользователей' })
  @ApiQuery({ name: 'search', required: false })
  @ApiQuery({ name: 'planId', required: false })
  @ApiQuery({ name: 'page', required: false })
  async listUsers(
    @Query('search') search?: string,
    @Query('planId') planId?: string,
    @Query('page') page?: string,
  ) {
    return this.adminUsers.list({
      search,
      planId,
      page: page ? parseInt(page, 10) : 1,
    });
  }

  @Get('users/:id')
  @ApiOperation({ summary: 'Пользователь по ID' })
  async getUser(@Param('id') id: string) {
    return this.adminUsers.getById(id);
  }

  @Patch('users/:id')
  @ApiOperation({ summary: 'Обновить пользователя (бан, роль, тариф)' })
  async updateUser(
    @Param('id') id: string,
    @Body() body: {
      isActive?: boolean;
      isAdmin?: boolean;
      isVerified?: boolean;
      planId?: string | null;
      tokenBalance?: number;
    },
  ) {
    return this.adminUsers.update(id, body);
  }

  // ── Support ──

  @Get('support/tickets')
  @ApiOperation({ summary: 'Тикеты поддержки' })
  @ApiQuery({ name: 'status', required: false })
  @ApiQuery({ name: 'priority', required: false })
  @ApiQuery({ name: 'page', required: false })
  async listTickets(
    @Query('status') status?: string,
    @Query('priority') priority?: string,
    @Query('page') page?: string,
  ) {
    return this.adminSupport.listTickets({
      status,
      priority,
      page: page ? parseInt(page, 10) : 1,
    });
  }

  @Get('support/tickets/:id')
  @ApiOperation({ summary: 'Тикет с сообщениями' })
  async getTicket(@Param('id') id: string) {
    return this.adminSupport.getTicket(id);
  }

  @Post('support/tickets/:id/reply')
  @ApiOperation({ summary: 'Ответить на тикет' })
  async replyTicket(
    @Param('id') id: string,
    @Body() body: { content: string },
  ) {
    return this.adminSupport.reply(id, body.content);
  }

  @Post('support/tickets/:id/close')
  @ApiOperation({ summary: 'Закрыть тикет' })
  async closeTicket(@Param('id') id: string) {
    return this.adminSupport.closeTicket(id);
  }

  // ── CMS Pages ──

  @Get('pages')
  @ApiOperation({ summary: 'Все CMS-страницы' })
  async listPages() {
    return this.adminCms.listPages();
  }

  @Get('pages/:id')
  @ApiOperation({ summary: 'CMS-страница по ID' })
  async getPage(@Param('id') id: string) {
    return this.adminCms.getPage(id);
  }

  @Post('pages')
  @ApiOperation({ summary: 'Создать/обновить CMS-страницу' })
  async upsertPage(
    @Body() body: {
      slug: string;
      title: Record<string, string>;
      content: Record<string, string>;
      isPublic?: boolean;
      sortOrder?: number;
    },
  ) {
    return this.adminCms.upsertPage(body);
  }

  @Delete('pages/:id')
  @ApiOperation({ summary: 'Удалить CMS-страницу' })
  async deletePage(@Param('id') id: string) {
    return this.adminCms.deletePage(id);
  }

  // ── Menu ──

  @Get('menu')
  @ApiOperation({ summary: 'Меню (дерево)' })
  async listMenu() {
    return this.adminCms.listMenuItems();
  }

  @Post('menu')
  @ApiOperation({ summary: 'Создать/обновить пункт меню' })
  async upsertMenu(
    @Body() body: {
      id?: string;
      parentId?: string;
      label: Record<string, string>;
      url?: string;
      icon?: string;
      planIds?: string[];
      isActive?: boolean;
      sortOrder?: number;
    },
  ) {
    return this.adminCms.upsertMenuItem(body);
  }

  @Delete('menu/:id')
  @ApiOperation({ summary: 'Удалить пункт меню' })
  async deleteMenu(@Param('id') id: string) {
    return this.adminCms.deleteMenuItem(id);
  }

  // ── Settings ──

  @Post('settings/telegram/webhook')
  @ApiOperation({ summary: 'Установить Telegram webhook' })
  async setupTelegramWebhook(@Body() body: { url: string }) {
    return this.adminSettings.setupTelegramWebhook(body.url);
  }

  @Get('settings/mcp')
  @ApiOperation({ summary: 'MCP-конфигурации' })
  async getMcpConfigs() {
    return this.adminSettings.getMcpConfigs();
  }

  @Get('settings/marketing')
  @ApiOperation({ summary: 'Маркетинговые настройки' })
  async getMarketingSettings() {
    return this.adminSettings.getMarketingSettings();
  }
}

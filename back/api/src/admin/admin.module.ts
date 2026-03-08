import { Module } from '@nestjs/common';
import { AdminController } from './admin.controller';
import { AdminUsersService } from './admin-users.service';
import { AdminSupportService } from './admin-support.service';
import { AdminCmsService } from './admin-cms.service';
import { AdminSettingsService } from './admin-settings.service';
import { TelegramModule } from '../telegram/telegram.module';

@Module({
  imports: [TelegramModule],
  controllers: [AdminController],
  providers: [AdminUsersService, AdminSupportService, AdminCmsService, AdminSettingsService],
})
export class AdminModule {}

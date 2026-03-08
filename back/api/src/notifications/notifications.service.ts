import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationsGateway } from './notifications.gateway';

@Injectable()
export class NotificationsService {
  constructor(
    private prisma: PrismaService,
    private gateway: NotificationsGateway,
  ) {}

  /** Create notification and push via WebSocket */
  async notify(
    userId: string,
    type: string,
    title: string,
    body?: string,
    data?: Record<string, any>,
  ) {
    const notification = await this.prisma.notification.create({
      data: { userId, type, title, body, data: data || {} },
    });

    this.gateway.sendToUser(userId, 'notification', notification);
    return notification;
  }

  /** AI task completed — special notification */
  async notifyAiTaskDone(userId: string, taskId: string, agentType: string) {
    return this.notify(userId, 'ai_done', 'AI-задача завершена', undefined, {
      taskId,
      agentType,
    });
  }

  /** AI task failed */
  async notifyAiTaskError(userId: string, taskId: string, error: string) {
    return this.notify(userId, 'ai_error', 'Ошибка AI-задачи', error, {
      taskId,
    });
  }

  /** Get user notifications */
  async getUserNotifications(userId: string, take = 50) {
    return this.prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take,
    });
  }

  /** Mark as read */
  async markRead(userId: string, notificationId: string) {
    return this.prisma.notification.updateMany({
      where: { id: notificationId, userId },
      data: { isRead: true },
    });
  }

  /** Mark all as read */
  async markAllRead(userId: string) {
    return this.prisma.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true },
    });
  }

  /** Unread count */
  async unreadCount(userId: string) {
    return this.prisma.notification.count({
      where: { userId, isRead: false },
    });
  }
}

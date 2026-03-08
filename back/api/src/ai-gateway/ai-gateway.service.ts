import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import type { Queue } from 'bull';
import { PrismaService } from '../prisma/prisma.service';
import { TokenService } from '../payments/token.service';
import { IntegrationsService } from '../integrations/integrations.service';
import { NotificationsService } from '../notifications/notifications.service';
import { AiRunDto } from './ai-run.dto';

/** Token cost per agent type */
const TOKEN_COSTS: Record<string, number> = {
  chat: 1,
  txt2img: 5,
  txt2audio: 10,
  txt2video: 50,
  lipsync: 30,
};

@Injectable()
export class AiGatewayService {
  constructor(
    private prisma: PrismaService,
    private tokenService: TokenService,
    private integrationsService: IntegrationsService,
    private notificationsService: NotificationsService,
    @InjectQueue('ai-tasks') private aiQueue: Queue,
  ) {}

  async runTask(userId: string, dto: AiRunDto) {
    const cost = TOKEN_COSTS[dto.agentType] || 1;

    // 1. Check token balance
    const hasTokens = await this.tokenService.hasEnough(userId, cost);
    if (!hasTokens) {
      throw new BadRequestException(
        `Insufficient tokens. Required: ${cost}. Top up at /profile/payment`,
      );
    }

    // 2. Check if user has custom API key for this provider
    const provider = dto.provider || 'anthropic';
    const userKey = await this.integrationsService.getDecryptedKey(userId, provider);

    // 3. Create task record
    const task = await this.prisma.aiTask.create({
      data: {
        userId,
        agentType: dto.agentType,
        provider,
        params: dto.params,
        status: 'pending',
        tokensUsed: cost,
      },
    });

    // 4. Deduct tokens
    await this.tokenService.deduct(userId, cost, `ai:${dto.agentType}`);

    // 5. Enqueue to Redis (Celery worker picks up)
    await this.aiQueue.add(dto.agentType, {
      taskId: task.id,
      agentType: dto.agentType,
      provider,
      model: dto.model,
      params: dto.params,
      userId,
      userApiKey: userKey || undefined,
    });

    // 6. Update status
    await this.prisma.aiTask.update({
      where: { id: task.id },
      data: { status: 'queued' },
    });

    return { taskId: task.id, status: 'queued', tokensUsed: cost };
  }

  /** Called by Bull processor or webhook when task completes */
  async completeTask(taskId: string, result: string, mediaUrl?: string) {
    const task = await this.prisma.aiTask.update({
      where: { id: taskId },
      data: { status: 'done', result, mediaUrl },
    });

    await this.notificationsService.notifyAiTaskDone(
      task.userId,
      taskId,
      task.agentType,
    );

    return task;
  }

  /** Called when task fails */
  async failTask(taskId: string, error: string) {
    const task = await this.prisma.aiTask.update({
      where: { id: taskId },
      data: { status: 'error', error },
    });

    // Refund tokens on failure
    await this.tokenService.topUp(task.userId, task.tokensUsed);

    await this.notificationsService.notifyAiTaskError(
      task.userId,
      taskId,
      error,
    );

    return task;
  }

  async getTaskStatus(taskId: string) {
    return this.prisma.aiTask.findUnique({
      where: { id: taskId },
      select: {
        id: true,
        agentType: true,
        status: true,
        result: true,
        mediaUrl: true,
        error: true,
        tokensUsed: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  async getUserTasks(userId: string, limit = 20) {
    return this.prisma.aiTask.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  }
}

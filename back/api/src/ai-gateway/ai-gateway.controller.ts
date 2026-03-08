import { Controller, Post, Get, Body, Param, Req } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiExcludeEndpoint } from '@nestjs/swagger';
import { AiGatewayService } from './ai-gateway.service';
import { AiRunDto } from './ai-run.dto';
import { Public } from '../auth/public.decorator';

@ApiTags('AI')
@Controller('ai')
export class AiGatewayController {
  constructor(private aiGateway: AiGatewayService) {}

  @Post('run')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Запустить AI-задачу' })
  async run(@Req() req: any, @Body() dto: AiRunDto) {
    const user = req.user;
    return this.aiGateway.runTask(user.userId, dto);
  }

  @Get('tasks/:taskId')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Статус AI-задачи' })
  async getTask(@Param('taskId') taskId: string) {
    return this.aiGateway.getTaskStatus(taskId);
  }

  @Get('tasks')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Мои AI-задачи' })
  async myTasks(@Req() req: any) {
    return this.aiGateway.getUserTasks(req.user.userId);
  }

  // ── Internal callback from AI-worker (no JWT, internal network only) ──

  @Post('callback/complete')
  @Public()
  @ApiExcludeEndpoint()
  async callbackComplete(
    @Body() body: { taskId: string; result: string; mediaUrl?: string },
  ) {
    return this.aiGateway.completeTask(body.taskId, body.result, body.mediaUrl);
  }

  @Post('callback/fail')
  @Public()
  @ApiExcludeEndpoint()
  async callbackFail(
    @Body() body: { taskId: string; error: string },
  ) {
    return this.aiGateway.failTask(body.taskId, body.error);
  }
}

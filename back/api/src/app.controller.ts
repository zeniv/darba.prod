import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { Public } from './auth/public.decorator';
import { PrismaService } from './prisma/prisma.service';

@ApiTags('System')
@Controller()
export class AppController {
  constructor(private prisma: PrismaService) {}

  @Get('health')
  @Public()
  @ApiOperation({ summary: 'Health check' })
  health() {
    return { status: 'ok', service: 'darba-api', timestamp: new Date().toISOString() };
  }

  @Get('health/detailed')
  @Public()
  @ApiOperation({ summary: 'Detailed health check (DB, memory, uptime)' })
  async healthDetailed() {
    const mem = process.memoryUsage();
    const checks: Record<string, any> = {
      status: 'ok',
      service: 'darba-api',
      timestamp: new Date().toISOString(),
      uptime: Math.floor(process.uptime()),
      memory: {
        rss: `${Math.round(mem.rss / 1024 / 1024)}MB`,
        heap: `${Math.round(mem.heapUsed / 1024 / 1024)}/${Math.round(mem.heapTotal / 1024 / 1024)}MB`,
      },
      db: 'fail',
    };

    try {
      await this.prisma.$queryRawUnsafe('SELECT 1');
      checks.db = 'ok';
    } catch {
      checks.status = 'degraded';
    }

    return checks;
  }
}

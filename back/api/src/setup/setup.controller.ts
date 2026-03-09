import { Controller, Get, Post, Body, ForbiddenException } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { Public } from '../auth/public.decorator';
import { PrismaService } from '../prisma/prisma.service';

@ApiTags('Setup')
@Controller('setup')
export class SetupController {
  constructor(private prisma: PrismaService) {}

  @Get('status')
  @Public()
  @ApiOperation({ summary: 'Check if initial setup is needed' })
  async status() {
    const userCount = await this.prisma.user.count();
    return { needsSetup: userCount === 0 };
  }

  @Post('init')
  @Public()
  @ApiOperation({ summary: 'Create first admin user (only works on empty DB)' })
  async init(
    @Body() body: { keycloakId: string; email: string; displayName?: string },
  ) {
    const userCount = await this.prisma.user.count();
    if (userCount > 0) {
      throw new ForbiddenException('Setup already completed');
    }

    const admin = await this.prisma.user.create({
      data: {
        keycloakId: body.keycloakId,
        email: body.email,
        displayName: body.displayName || 'Admin',
        isAdmin: true,
      },
    });

    return { message: 'Admin user created', userId: admin.id };
  }
}

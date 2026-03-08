import { Controller, Get, Patch, Body, Req, Param } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { Public } from '../auth/public.decorator';

@ApiTags('Users')
@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get('me')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Текущий пользователь' })
  async getMe(@Req() req: any) {
    return this.usersService.findOrCreate(req.user.keycloakId, req.user.email);
  }

  @Patch('me')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Обновить профиль' })
  async updateMe(
    @Req() req: any,
    @Body() body: { displayName?: string; username?: string; bio?: string },
  ) {
    const user = await this.usersService.findOrCreate(
      req.user.keycloakId,
      req.user.email,
    );
    return this.usersService.updateProfile(user.id, body);
  }

  @Get(':username')
  @Public()
  @ApiOperation({ summary: 'Публичный профиль пользователя' })
  async getPublicProfile(@Param('username') username: string) {
    return this.usersService.findByUsername(username);
  }
}

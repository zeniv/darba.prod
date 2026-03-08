import { Controller, Post, Get, Param, Body, Req } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { SocialService } from './social.service';
import { CreateCommentDto, CreateDonationDto } from './dto/social.dto';
import { Public } from '../auth/public.decorator';

@ApiTags('Social')
@Controller('social')
export class SocialController {
  constructor(private socialService: SocialService) {}

  // ── Likes ──

  @Post('posts/:postId/like')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Поставить/убрать лайк' })
  async toggleLike(@Param('postId') postId: string, @Req() req: any) {
    return this.socialService.toggleLike(req.user.userId, postId);
  }

  @Get('posts/:postId/liked')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Лайкнул ли я этот пост' })
  async isLiked(@Param('postId') postId: string, @Req() req: any) {
    return this.socialService.isLiked(req.user.userId, postId);
  }

  // ── Comments ──

  @Post('posts/:postId/comments')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Добавить комментарий' })
  async addComment(
    @Param('postId') postId: string,
    @Req() req: any,
    @Body() dto: CreateCommentDto,
  ) {
    return this.socialService.addComment(req.user.userId, postId, dto.content);
  }

  @Get('posts/:postId/comments')
  @Public()
  @ApiOperation({ summary: 'Комментарии поста' })
  async getComments(@Param('postId') postId: string) {
    return this.socialService.getComments(postId);
  }

  // ── Follows ──

  @Post('users/:userId/follow')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Подписаться/отписаться' })
  async toggleFollow(@Param('userId') userId: string, @Req() req: any) {
    return this.socialService.toggleFollow(req.user.userId, userId);
  }

  @Get('users/:userId/following')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Подписан ли я' })
  async isFollowing(@Param('userId') userId: string, @Req() req: any) {
    return this.socialService.isFollowing(req.user.userId, userId);
  }

  @Get('users/:userId/followers')
  @Public()
  @ApiOperation({ summary: 'Подписчики' })
  async getFollowers(@Param('userId') userId: string) {
    return this.socialService.getFollowers(userId);
  }

  @Get('users/:userId/follows')
  @Public()
  @ApiOperation({ summary: 'Подписки' })
  async getFollowing(@Param('userId') userId: string) {
    return this.socialService.getFollowing(userId);
  }

  @Get('users/:userId/counts')
  @Public()
  @ApiOperation({ summary: 'Количество подписчиков/подписок' })
  async getFollowCounts(@Param('userId') userId: string) {
    return this.socialService.getFollowCounts(userId);
  }

  // ── Donations ──

  @Post('donate')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Отправить донат (в токенах)' })
  async donate(@Req() req: any, @Body() dto: CreateDonationDto) {
    return this.socialService.donate(
      req.user.userId,
      dto.recipientId,
      dto.amount,
      dto.message,
    );
  }
}

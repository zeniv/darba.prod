import { Controller, Post, Get, Patch, Delete, Body, Param, Query, Req, Logger } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { ContentService } from './content.service';
import { CreatePostDto, UpdatePostDto } from './dto/create-post.dto';
import { Public } from '../auth/public.decorator';
import { VkPostingService } from '../integrations/vk-posting.service';

@ApiTags('Content')
@Controller('posts')
export class ContentController {
  private readonly logger = new Logger(ContentController.name);

  constructor(
    private contentService: ContentService,
    private vkPosting: VkPostingService,
  ) {}

  @Post()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Создать публикацию' })
  async create(@Req() req: any, @Body() dto: CreatePostDto) {
    const { shareToVk, ...postData } = dto;
    const post = await this.contentService.create(req.user.userId, postData);

    // Auto-post to VK (fire-and-forget)
    if (shareToVk) {
      this.shareToVk(req.user.userId, post).catch(() => {});
    }

    return post;
  }

  private async shareToVk(userId: string, post: any) {
    const text = [post.title, post.content].filter(Boolean).join('\n\n');
    const message = text || 'Новая публикация в Darba';

    const attachments: string[] = [];
    if (post.mediaUrls?.length && post.mediaType === 'image') {
      for (const url of post.mediaUrls.slice(0, 4)) {
        const att = await this.vkPosting.uploadPhoto(userId, url);
        if (att) attachments.push(att);
      }
    }

    const result = await this.vkPosting.postToWall(userId, message, attachments);
    if (result.ok) {
      this.logger.log(`VK auto-post: postId=${result.postId} for user ${userId}`);
    }
  }

  @Get('feed')
  @Public()
  @ApiOperation({ summary: 'Публичная лента' })
  @ApiQuery({ name: 'cursor', required: false })
  @ApiQuery({ name: 'take', required: false })
  async publicFeed(
    @Query('cursor') cursor?: string,
    @Query('take') take?: string,
  ) {
    return this.contentService.publicFeed(cursor, take ? parseInt(take, 10) : 20);
  }

  @Get('following')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Лента подписок' })
  @ApiQuery({ name: 'cursor', required: false })
  async followingFeed(@Req() req: any, @Query('cursor') cursor?: string) {
    return this.contentService.followingFeed(req.user.userId, cursor);
  }

  @Get('my')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Мои публикации' })
  async myPosts(@Req() req: any) {
    return this.contentService.userPosts(req.user.userId);
  }

  @Get(':id')
  @Public()
  @ApiOperation({ summary: 'Публикация по ID' })
  async findById(@Param('id') id: string) {
    return this.contentService.findById(id);
  }

  @Patch(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Обновить публикацию' })
  async update(@Param('id') id: string, @Req() req: any, @Body() dto: UpdatePostDto) {
    return this.contentService.update(id, req.user.userId, dto);
  }

  @Delete(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Удалить публикацию' })
  async delete(@Param('id') id: string, @Req() req: any) {
    return this.contentService.delete(id, req.user.userId);
  }
}

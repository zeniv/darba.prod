import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ContentService {
  constructor(private prisma: PrismaService) {}

  async create(
    userId: string,
    data: {
      title?: string;
      content?: string;
      mediaUrls?: string[];
      mediaType?: string;
      isPublic?: boolean;
      aiTaskId?: string;
      tags?: string[];
    },
  ) {
    return this.prisma.post.create({
      data: {
        userId,
        title: data.title,
        content: data.content,
        mediaUrls: data.mediaUrls || [],
        mediaType: data.mediaType,
        isPublic: data.isPublic ?? true,
        aiTaskId: data.aiTaskId,
        tags: data.tags || [],
      },
      include: {
        user: { select: { id: true, username: true, displayName: true, avatarUrl: true } },
        _count: { select: { likes: true, comments: true } },
      },
    });
  }

  async findById(postId: string) {
    const post = await this.prisma.post.findUnique({
      where: { id: postId },
      include: {
        user: { select: { id: true, username: true, displayName: true, avatarUrl: true } },
        _count: { select: { likes: true, comments: true } },
      },
    });
    if (!post) throw new NotFoundException('Post not found');
    return post;
  }

  async update(
    postId: string,
    userId: string,
    data: { title?: string; content?: string; isPublic?: boolean; tags?: string[] },
  ) {
    const post = await this.prisma.post.findUnique({ where: { id: postId } });
    if (!post) throw new NotFoundException('Post not found');
    if (post.userId !== userId) throw new ForbiddenException();

    return this.prisma.post.update({
      where: { id: postId },
      data,
      include: {
        user: { select: { id: true, username: true, displayName: true, avatarUrl: true } },
        _count: { select: { likes: true, comments: true } },
      },
    });
  }

  async delete(postId: string, userId: string) {
    const post = await this.prisma.post.findUnique({ where: { id: postId } });
    if (!post) throw new NotFoundException('Post not found');
    if (post.userId !== userId) throw new ForbiddenException();

    await this.prisma.post.delete({ where: { id: postId } });
    return { ok: true };
  }

  /** Public feed — paginated, newest first */
  async publicFeed(cursor?: string, take = 20) {
    return this.prisma.post.findMany({
      where: { isPublic: true },
      orderBy: { createdAt: 'desc' },
      take,
      ...(cursor ? { skip: 1, cursor: { id: cursor } } : {}),
      include: {
        user: { select: { id: true, username: true, displayName: true, avatarUrl: true } },
        _count: { select: { likes: true, comments: true } },
      },
    });
  }

  /** User's own posts */
  async userPosts(userId: string, take = 50) {
    return this.prisma.post.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take,
      include: {
        _count: { select: { likes: true, comments: true } },
      },
    });
  }

  /** Public posts of a user (for profile page) */
  async publicUserPosts(userId: string, take = 50) {
    return this.prisma.post.findMany({
      where: { userId, isPublic: true },
      orderBy: { createdAt: 'desc' },
      take,
      include: {
        _count: { select: { likes: true, comments: true } },
      },
    });
  }

  /** Following feed — posts from users I follow */
  async followingFeed(userId: string, cursor?: string, take = 20) {
    const followingIds = await this.prisma.follow.findMany({
      where: { followerId: userId },
      select: { followingId: true },
    });
    const ids = followingIds.map((f) => f.followingId);

    return this.prisma.post.findMany({
      where: { userId: { in: ids }, isPublic: true },
      orderBy: { createdAt: 'desc' },
      take,
      ...(cursor ? { skip: 1, cursor: { id: cursor } } : {}),
      include: {
        user: { select: { id: true, username: true, displayName: true, avatarUrl: true } },
        _count: { select: { likes: true, comments: true } },
      },
    });
  }
}

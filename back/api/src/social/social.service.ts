import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { TokenService } from '../payments/token.service';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class SocialService {
  constructor(
    private prisma: PrismaService,
    private tokenService: TokenService,
    private notificationsService: NotificationsService,
  ) {}

  // ── Likes ──

  async toggleLike(userId: string, postId: string) {
    const existing = await this.prisma.like.findUnique({
      where: { userId_postId: { userId, postId } },
    });

    if (existing) {
      await this.prisma.like.delete({ where: { id: existing.id } });
      return { liked: false };
    }

    await this.prisma.like.create({ data: { userId, postId } });

    // Notify post owner
    const post = await this.prisma.post.findUnique({
      where: { id: postId },
      select: { userId: true },
    });
    if (post && post.userId !== userId) {
      await this.notificationsService.notify(
        post.userId,
        'like',
        'Новый лайк',
        undefined,
        { postId, fromUserId: userId },
      );
    }

    return { liked: true };
  }

  async isLiked(userId: string, postId: string) {
    const like = await this.prisma.like.findUnique({
      where: { userId_postId: { userId, postId } },
    });
    return { liked: !!like };
  }

  // ── Comments ──

  async addComment(userId: string, postId: string, content: string) {
    const comment = await this.prisma.comment.create({
      data: { userId, postId, content },
      include: {
        user: { select: { id: true, username: true, displayName: true, avatarUrl: true } },
      },
    });

    // Notify post owner
    const post = await this.prisma.post.findUnique({
      where: { id: postId },
      select: { userId: true },
    });
    if (post && post.userId !== userId) {
      await this.notificationsService.notify(
        post.userId,
        'comment',
        'Новый комментарий',
        content.slice(0, 100),
        { postId, commentId: comment.id, fromUserId: userId },
      );
    }

    return comment;
  }

  async getComments(postId: string, take = 50) {
    return this.prisma.comment.findMany({
      where: { postId },
      orderBy: { createdAt: 'asc' },
      take,
      include: {
        user: { select: { id: true, username: true, displayName: true, avatarUrl: true } },
      },
    });
  }

  // ── Follows ──

  async toggleFollow(followerId: string, followingId: string) {
    if (followerId === followingId) {
      throw new BadRequestException('Cannot follow yourself');
    }

    const existing = await this.prisma.follow.findUnique({
      where: { followerId_followingId: { followerId, followingId } },
    });

    if (existing) {
      await this.prisma.follow.delete({ where: { id: existing.id } });
      return { following: false };
    }

    await this.prisma.follow.create({ data: { followerId, followingId } });

    await this.notificationsService.notify(
      followingId,
      'follow',
      'Новый подписчик',
      undefined,
      { fromUserId: followerId },
    );

    return { following: true };
  }

  async isFollowing(followerId: string, followingId: string) {
    const follow = await this.prisma.follow.findUnique({
      where: { followerId_followingId: { followerId, followingId } },
    });
    return { following: !!follow };
  }

  async getFollowers(userId: string) {
    return this.prisma.follow.findMany({
      where: { followingId: userId },
      include: {
        follower: { select: { id: true, username: true, displayName: true, avatarUrl: true } },
      },
    });
  }

  async getFollowing(userId: string) {
    return this.prisma.follow.findMany({
      where: { followerId: userId },
      include: {
        following: { select: { id: true, username: true, displayName: true, avatarUrl: true } },
      },
    });
  }

  async getFollowCounts(userId: string) {
    const [followers, following] = await Promise.all([
      this.prisma.follow.count({ where: { followingId: userId } }),
      this.prisma.follow.count({ where: { followerId: userId } }),
    ]);
    return { followers, following };
  }

  // ── Donations ──

  async donate(donorId: string, recipientId: string, amount: number, message?: string) {
    if (donorId === recipientId) {
      throw new BadRequestException('Cannot donate to yourself');
    }

    // Check and deduct tokens
    await this.tokenService.deduct(donorId, amount, `donation:${recipientId}`);

    // Credit recipient
    await this.tokenService.topUp(recipientId, amount);

    // Record donation
    const donation = await this.prisma.donation.create({
      data: { donorId, recipientId, amount, message },
    });

    await this.notificationsService.notify(
      recipientId,
      'donation',
      `Донат: ${amount} токенов`,
      message,
      { donationId: donation.id, fromUserId: donorId, amount },
    );

    return donation;
  }
}

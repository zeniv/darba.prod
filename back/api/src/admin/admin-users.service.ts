import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AdminUsersService {
  constructor(private prisma: PrismaService) {}

  async list(params: {
    search?: string;
    planId?: string;
    isActive?: boolean;
    page?: number;
    take?: number;
  }) {
    const { search, planId, isActive, page = 1, take = 50 } = params;
    const where: any = {};

    if (search) {
      where.OR = [
        { email: { contains: search, mode: 'insensitive' } },
        { username: { contains: search, mode: 'insensitive' } },
        { displayName: { contains: search, mode: 'insensitive' } },
      ];
    }
    if (planId) where.planId = planId;
    if (isActive !== undefined) where.isActive = isActive;

    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * take,
        take,
        include: { plan: true },
      }),
      this.prisma.user.count({ where }),
    ]);

    return { users, total, page, pages: Math.ceil(total / take) };
  }

  async getById(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: {
        plan: true,
        _count: {
          select: { posts: true, payments: true, aiTasks: true, tickets: true },
        },
      },
    });
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async update(id: string, data: {
    isActive?: boolean;
    isAdmin?: boolean;
    isVerified?: boolean;
    planId?: string | null;
    tokenBalance?: number;
  }) {
    return this.prisma.user.update({ where: { id }, data });
  }

  async stats() {
    const [totalUsers, activeUsers, paidUsers, totalPosts, totalPayments] =
      await Promise.all([
        this.prisma.user.count(),
        this.prisma.user.count({ where: { isActive: true } }),
        this.prisma.user.count({ where: { planId: { not: null } } }),
        this.prisma.post.count(),
        this.prisma.payment.count({ where: { status: 'paid' } }),
      ]);

    // New users last 7 days
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    const newUsersWeek = await this.prisma.user.count({
      where: { createdAt: { gte: weekAgo } },
    });

    // Revenue
    const revenue = await this.prisma.payment.aggregate({
      where: { status: 'paid' },
      _sum: { amount: true },
    });

    return {
      totalUsers,
      activeUsers,
      paidUsers,
      newUsersWeek,
      totalPosts,
      totalPayments,
      totalRevenue: revenue._sum.amount || 0,
    };
  }
}

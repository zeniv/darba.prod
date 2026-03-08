import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PlansService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.plan.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: 'asc' },
    });
  }

  async findById(id: string) {
    const plan = await this.prisma.plan.findUnique({ where: { id } });
    if (!plan) throw new NotFoundException('Plan not found');
    return plan;
  }

  async findByName(name: string) {
    return this.prisma.plan.findUnique({ where: { name } });
  }

  async create(data: {
    name: string;
    displayName: string;
    price: number;
    currency?: string;
    period?: string;
    tokens: number;
    features?: Record<string, any>;
    sortOrder?: number;
  }) {
    return this.prisma.plan.create({
      data: {
        name: data.name,
        displayName: data.displayName,
        price: data.price,
        currency: data.currency || 'RUB',
        period: data.period || 'month',
        tokens: data.tokens,
        features: data.features || {},
        sortOrder: data.sortOrder || 0,
      },
    });
  }

  async update(
    id: string,
    data: Partial<{
      displayName: string;
      price: number;
      currency: string;
      period: string;
      tokens: number;
      features: Record<string, any>;
      isActive: boolean;
      sortOrder: number;
    }>,
  ) {
    return this.prisma.plan.update({ where: { id }, data });
  }

  /** Seed default plans if DB is empty */
  async seedDefaults() {
    const count = await this.prisma.plan.count();
    if (count > 0) return;

    await this.prisma.plan.createMany({
      data: [
        {
          name: 'Free',
          displayName: 'Free',
          price: 0,
          currency: 'RUB',
          period: 'month',
          tokens: 50,
          features: {
            chat: true,
            txt2img: true,
            txt2audio: false,
            txt2video: false,
            lipsync: false,
            maxResolution: '512x512',
          },
          sortOrder: 0,
        },
        {
          name: 'Max',
          displayName: 'Max',
          price: 990,
          currency: 'RUB',
          period: 'month',
          tokens: 5000,
          features: {
            chat: true,
            txt2img: true,
            txt2audio: true,
            txt2video: false,
            lipsync: false,
            maxResolution: '1024x1024',
          },
          sortOrder: 1,
        },
        {
          name: 'Pro',
          displayName: 'Pro',
          price: 2990,
          currency: 'RUB',
          period: 'month',
          tokens: 30000,
          features: {
            chat: true,
            txt2img: true,
            txt2audio: true,
            txt2video: true,
            lipsync: true,
            maxResolution: '2048x2048',
          },
          sortOrder: 2,
        },
      ],
    });
  }
}

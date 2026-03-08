import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class TokenService {
  constructor(private prisma: PrismaService) {}

  /** Get user token balance */
  async getBalance(userId: string): Promise<number> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { tokenBalance: true },
    });
    return user?.tokenBalance || 0;
  }

  /** Deduct tokens for AI task usage */
  async deduct(userId: string, amount: number, reason: string): Promise<number> {
    if (amount <= 0) throw new BadRequestException('Amount must be positive');

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { tokenBalance: true },
    });

    if (!user || user.tokenBalance < amount) {
      throw new BadRequestException('Insufficient token balance');
    }

    const updated = await this.prisma.user.update({
      where: { id: userId },
      data: { tokenBalance: { decrement: amount } },
      select: { tokenBalance: true },
    });

    return updated.tokenBalance;
  }

  /** Add tokens (purchase, bonus, admin) */
  async topUp(userId: string, amount: number): Promise<number> {
    if (amount <= 0) throw new BadRequestException('Amount must be positive');

    const updated = await this.prisma.user.update({
      where: { id: userId },
      data: { tokenBalance: { increment: amount } },
      select: { tokenBalance: true },
    });

    return updated.tokenBalance;
  }

  /** Check if user has enough tokens */
  async hasEnough(userId: string, amount: number): Promise<boolean> {
    const balance = await this.getBalance(userId);
    return balance >= amount;
  }
}

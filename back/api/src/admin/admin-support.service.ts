import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AdminSupportService {
  constructor(private prisma: PrismaService) {}

  async listTickets(params: {
    status?: string;
    priority?: string;
    page?: number;
    take?: number;
  }) {
    const { status, priority, page = 1, take = 50 } = params;
    const where: any = {};
    if (status) where.status = status;
    if (priority) where.priority = priority;

    const [tickets, total] = await Promise.all([
      this.prisma.supportTicket.findMany({
        where,
        orderBy: { updatedAt: 'desc' },
        skip: (page - 1) * take,
        take,
        include: {
          user: { select: { id: true, email: true, displayName: true } },
          messages: { orderBy: { createdAt: 'desc' }, take: 1 },
        },
      }),
      this.prisma.supportTicket.count({ where }),
    ]);

    return { tickets, total, page, pages: Math.ceil(total / take) };
  }

  async getTicket(ticketId: string) {
    const ticket = await this.prisma.supportTicket.findUnique({
      where: { id: ticketId },
      include: {
        user: { select: { id: true, email: true, displayName: true, username: true } },
        messages: { orderBy: { createdAt: 'asc' } },
      },
    });
    if (!ticket) throw new NotFoundException('Ticket not found');
    return ticket;
  }

  async reply(ticketId: string, content: string) {
    await this.prisma.supportTicket.update({
      where: { id: ticketId },
      data: { status: 'in_progress' },
    });

    return this.prisma.supportMessage.create({
      data: { ticketId, isAdmin: true, content },
    });
  }

  async closeTicket(ticketId: string) {
    return this.prisma.supportTicket.update({
      where: { id: ticketId },
      data: { status: 'closed' },
    });
  }
}

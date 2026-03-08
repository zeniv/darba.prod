import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SupportService {
  constructor(private prisma: PrismaService) {}

  async createTicket(userId: string, subject: string, message: string, priority = 'normal') {
    return this.prisma.supportTicket.create({
      data: {
        userId,
        subject,
        priority,
        messages: {
          create: { authorId: userId, content: message },
        },
      },
      include: { messages: true },
    });
  }

  async getUserTickets(userId: string) {
    return this.prisma.supportTicket.findMany({
      where: { userId },
      orderBy: { updatedAt: 'desc' },
      include: {
        messages: { orderBy: { createdAt: 'desc' }, take: 1 },
      },
    });
  }

  async getTicket(ticketId: string, userId: string) {
    const ticket = await this.prisma.supportTicket.findUnique({
      where: { id: ticketId },
      include: {
        messages: { orderBy: { createdAt: 'asc' } },
      },
    });

    if (!ticket) throw new NotFoundException('Ticket not found');
    if (ticket.userId !== userId) throw new ForbiddenException();

    return ticket;
  }

  async addMessage(ticketId: string, userId: string, content: string) {
    // Verify ownership
    const ticket = await this.prisma.supportTicket.findUnique({
      where: { id: ticketId },
    });
    if (!ticket) throw new NotFoundException('Ticket not found');
    if (ticket.userId !== userId) throw new ForbiddenException();

    // Reopen if closed
    if (ticket.status === 'closed') {
      await this.prisma.supportTicket.update({
        where: { id: ticketId },
        data: { status: 'open' },
      });
    }

    return this.prisma.supportMessage.create({
      data: {
        ticketId,
        authorId: userId,
        content,
      },
    });
  }
}

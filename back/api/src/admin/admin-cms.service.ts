import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AdminCmsService {
  constructor(private prisma: PrismaService) {}

  // ── Pages ──

  async listPages() {
    return this.prisma.page.findMany({ orderBy: { sortOrder: 'asc' } });
  }

  async getPage(id: string) {
    const page = await this.prisma.page.findUnique({ where: { id } });
    if (!page) throw new NotFoundException('Page not found');
    return page;
  }

  async upsertPage(data: {
    slug: string;
    title: Record<string, string>;
    content: Record<string, string>;
    isPublic?: boolean;
    sortOrder?: number;
  }) {
    return this.prisma.page.upsert({
      where: { slug: data.slug },
      update: {
        title: data.title,
        content: data.content,
        isPublic: data.isPublic,
        sortOrder: data.sortOrder,
      },
      create: {
        slug: data.slug,
        title: data.title,
        content: data.content,
        isPublic: data.isPublic ?? true,
        sortOrder: data.sortOrder ?? 0,
      },
    });
  }

  async deletePage(id: string) {
    await this.prisma.page.delete({ where: { id } });
    return { ok: true };
  }

  // ── Menu Items ──

  async listMenuItems() {
    return this.prisma.menuItem.findMany({
      where: { parentId: null },
      orderBy: { sortOrder: 'asc' },
      include: {
        children: { orderBy: { sortOrder: 'asc' } },
      },
    });
  }

  async upsertMenuItem(data: {
    id?: string;
    parentId?: string;
    label: Record<string, string>;
    url?: string;
    icon?: string;
    planIds?: string[];
    isActive?: boolean;
    sortOrder?: number;
  }) {
    if (data.id) {
      return this.prisma.menuItem.update({
        where: { id: data.id },
        data: {
          parentId: data.parentId,
          label: data.label,
          url: data.url,
          icon: data.icon,
          planIds: data.planIds || [],
          isActive: data.isActive,
          sortOrder: data.sortOrder,
        },
      });
    }
    return this.prisma.menuItem.create({
      data: {
        parentId: data.parentId,
        label: data.label,
        url: data.url,
        icon: data.icon,
        planIds: data.planIds || [],
        isActive: data.isActive ?? true,
        sortOrder: data.sortOrder ?? 0,
      },
    });
  }

  async deleteMenuItem(id: string) {
    await this.prisma.menuItem.delete({ where: { id } });
    return { ok: true };
  }
}

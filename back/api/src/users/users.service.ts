import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async findByKeycloakId(keycloakId: string) {
    return this.prisma.user.findUnique({
      where: { keycloakId },
      include: { plan: true },
    });
  }

  async findByUsername(username: string) {
    return this.prisma.user.findUnique({
      where: { username },
    });
  }

  async findById(id: string) {
    return this.prisma.user.findUnique({
      where: { id },
      include: { plan: true },
    });
  }

  async createFromKeycloak(data: {
    keycloakId: string;
    email: string;
    displayName?: string;
  }) {
    return this.prisma.user.create({
      data: {
        keycloakId: data.keycloakId,
        email: data.email,
        displayName: data.displayName,
      },
      include: { plan: true },
    });
  }

  async findOrCreate(keycloakId: string, email: string) {
    const existing = await this.findByKeycloakId(keycloakId);
    if (existing) return existing;
    return this.createFromKeycloak({ keycloakId, email });
  }

  async updateProfile(
    id: string,
    data: { displayName?: string; username?: string; bio?: string; avatarUrl?: string },
  ) {
    return this.prisma.user.update({
      where: { id },
      data,
    });
  }
}

import { Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { createCipheriv, createDecipheriv, randomBytes } from 'crypto';

@Injectable()
export class IntegrationsService {
  private readonly encryptionKey: Buffer;

  constructor(
    private prisma: PrismaService,
    private config: ConfigService,
  ) {
    // 32-byte key for AES-256
    const keyHex = this.config.get('ENCRYPTION_KEY', '');
    this.encryptionKey = keyHex
      ? Buffer.from(keyHex, 'hex')
      : randomBytes(32);
  }

  encrypt(text: string): string {
    const iv = randomBytes(16);
    const cipher = createCipheriv('aes-256-cbc', this.encryptionKey, iv);
    const encrypted = Buffer.concat([cipher.update(text, 'utf8'), cipher.final()]);
    return iv.toString('hex') + ':' + encrypted.toString('hex');
  }

  decrypt(encrypted: string): string {
    const [ivHex, dataHex] = encrypted.split(':');
    const iv = Buffer.from(ivHex, 'hex');
    const data = Buffer.from(dataHex, 'hex');
    const decipher = createDecipheriv('aes-256-cbc', this.encryptionKey, iv);
    return Buffer.concat([decipher.update(data), decipher.final()]).toString('utf8');
  }

  async addKey(userId: string, type: string, provider: string, apiKey: string) {
    const encryptedKey = this.encrypt(apiKey);

    return this.prisma.userIntegration.upsert({
      where: {
        userId_type_provider: { userId, type, provider },
      },
      update: { encryptedKey, isActive: true },
      create: { userId, type, provider, encryptedKey },
    });
  }

  async getUserKeys(userId: string) {
    const integrations = await this.prisma.userIntegration.findMany({
      where: { userId, type: 'ai_key' },
      select: {
        id: true,
        provider: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    });
    return integrations;
  }

  async getDecryptedKey(userId: string, provider: string): Promise<string | null> {
    const integration = await this.prisma.userIntegration.findFirst({
      where: { userId, type: 'ai_key', provider, isActive: true },
    });
    if (!integration?.encryptedKey) return null;
    return this.decrypt(integration.encryptedKey);
  }

  async removeKey(userId: string, integrationId: string) {
    const integration = await this.prisma.userIntegration.findUnique({
      where: { id: integrationId },
    });
    if (!integration || integration.userId !== userId) {
      throw new NotFoundException('Integration not found');
    }
    return this.prisma.userIntegration.delete({ where: { id: integrationId } });
  }
}

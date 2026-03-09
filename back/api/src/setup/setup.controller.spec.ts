import { Test, TestingModule } from '@nestjs/testing';
import { ForbiddenException } from '@nestjs/common';
import { SetupController } from './setup.controller';
import { PrismaService } from '../prisma/prisma.service';

describe('SetupController', () => {
  let controller: SetupController;
  let prisma: {
    user: { count: jest.Mock; create: jest.Mock };
  };

  beforeEach(async () => {
    prisma = {
      user: {
        count: jest.fn(),
        create: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [SetupController],
      providers: [{ provide: PrismaService, useValue: prisma }],
    }).compile();

    controller = module.get(SetupController);
  });

  describe('GET /setup/status', () => {
    it('returns needsSetup=true when no users exist', async () => {
      prisma.user.count.mockResolvedValue(0);
      expect(await controller.status()).toEqual({ needsSetup: true });
    });

    it('returns needsSetup=false when users exist', async () => {
      prisma.user.count.mockResolvedValue(3);
      expect(await controller.status()).toEqual({ needsSetup: false });
    });
  });

  describe('POST /setup/init', () => {
    it('creates admin user on empty DB', async () => {
      prisma.user.count.mockResolvedValue(0);
      prisma.user.create.mockResolvedValue({ id: 'u1' });

      const result = await controller.init({
        keycloakId: 'kc-1',
        email: 'admin@test.com',
        displayName: 'Admin',
      });

      expect(result).toEqual({ message: 'Admin user created', userId: 'u1' });
      expect(prisma.user.create).toHaveBeenCalledWith({
        data: {
          keycloakId: 'kc-1',
          email: 'admin@test.com',
          displayName: 'Admin',
          isAdmin: true,
        },
      });
    });

    it('uses default displayName when not provided', async () => {
      prisma.user.count.mockResolvedValue(0);
      prisma.user.create.mockResolvedValue({ id: 'u2' });

      await controller.init({ keycloakId: 'kc-2', email: 'a@b.c' });

      expect(prisma.user.create).toHaveBeenCalledWith({
        data: expect.objectContaining({ displayName: 'Admin' }),
      });
    });

    it('throws ForbiddenException when users already exist', async () => {
      prisma.user.count.mockResolvedValue(1);

      await expect(
        controller.init({ keycloakId: 'kc-1', email: 'a@b.c' }),
      ).rejects.toThrow(ForbiddenException);
    });
  });
});

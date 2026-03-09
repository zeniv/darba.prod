import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { PrismaService } from '../prisma/prisma.service';

describe('UsersService', () => {
  let service: UsersService;
  let prisma: {
    user: {
      findUnique: jest.Mock;
      create: jest.Mock;
      update: jest.Mock;
    };
  };

  beforeEach(async () => {
    prisma = {
      user: {
        findUnique: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get(UsersService);
  });

  describe('findByKeycloakId', () => {
    it('returns user with plan included', async () => {
      const user = { id: '1', keycloakId: 'kc-1', plan: { name: 'Free' } };
      prisma.user.findUnique.mockResolvedValue(user);

      const result = await service.findByKeycloakId('kc-1');

      expect(result).toEqual(user);
      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { keycloakId: 'kc-1' },
        include: { plan: true },
      });
    });

    it('returns null for non-existent user', async () => {
      prisma.user.findUnique.mockResolvedValue(null);
      expect(await service.findByKeycloakId('unknown')).toBeNull();
    });
  });

  describe('findOrCreate', () => {
    it('returns existing user', async () => {
      const user = { id: '1', keycloakId: 'kc-1', email: 'a@b.c' };
      prisma.user.findUnique.mockResolvedValue(user);

      const result = await service.findOrCreate('kc-1', 'a@b.c');

      expect(result).toEqual(user);
      expect(prisma.user.create).not.toHaveBeenCalled();
    });

    it('creates new user when not found', async () => {
      prisma.user.findUnique.mockResolvedValue(null);
      const newUser = { id: '2', keycloakId: 'kc-2', email: 'new@b.c' };
      prisma.user.create.mockResolvedValue(newUser);

      const result = await service.findOrCreate('kc-2', 'new@b.c');

      expect(result).toEqual(newUser);
      expect(prisma.user.create).toHaveBeenCalledWith({
        data: {
          keycloakId: 'kc-2',
          email: 'new@b.c',
          displayName: undefined,
        },
        include: { plan: true },
      });
    });
  });

  describe('updateProfile', () => {
    it('updates user fields', async () => {
      const updated = { id: '1', displayName: 'New Name' };
      prisma.user.update.mockResolvedValue(updated);

      const result = await service.updateProfile('1', { displayName: 'New Name' });

      expect(result).toEqual(updated);
      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { id: '1' },
        data: { displayName: 'New Name' },
      });
    });
  });
});

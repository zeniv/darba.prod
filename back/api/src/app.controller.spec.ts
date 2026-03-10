import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { PrismaService } from './prisma/prisma.service';

describe('AppController', () => {
  let controller: AppController;
  const mockPrisma = {
    $queryRawUnsafe: jest.fn().mockResolvedValue([{ '?column?': 1 }]),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    controller = module.get<AppController>(AppController);
  });

  it('health returns ok', () => {
    const result = controller.health();
    expect(result.status).toBe('ok');
    expect(result.service).toBe('darba-api');
    expect(result.timestamp).toBeDefined();
  });

  it('healthDetailed returns ok with DB check', async () => {
    const result = await controller.healthDetailed();
    expect(result.status).toBe('ok');
    expect(result.db).toBe('ok');
    expect(result.uptime).toBeGreaterThanOrEqual(0);
    expect(result.memory).toBeDefined();
  });

  it('healthDetailed returns degraded when DB fails', async () => {
    mockPrisma.$queryRawUnsafe.mockRejectedValueOnce(new Error('DB down'));
    const result = await controller.healthDetailed();
    expect(result.status).toBe('degraded');
    expect(result.db).toBe('fail');
  });
});

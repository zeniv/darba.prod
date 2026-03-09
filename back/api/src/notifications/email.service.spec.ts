import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { EmailService } from './email.service';

describe('EmailService', () => {
  describe('without SMTP', () => {
    let service: EmailService;

    beforeEach(async () => {
      const module: TestingModule = await Test.createTestingModule({
        providers: [
          EmailService,
          {
            provide: ConfigService,
            useValue: {
              get: (key: string, fallback?: string) => {
                const map: Record<string, string> = {
                  EMAIL_FROM: 'test@darba.pro',
                };
                return map[key] || fallback;
              },
            },
          },
        ],
      }).compile();

      service = module.get(EmailService);
    });

    it('returns false in dry-run mode (no SMTP)', async () => {
      const result = await service.send('user@test.com', 'Test', '<p>Hi</p>');
      expect(result).toBe(false);
    });

    it('sendWelcome calls send with correct params', async () => {
      const spy = jest.spyOn(service, 'send').mockResolvedValue(false);
      await service.sendWelcome('user@test.com', 'Ivan');

      expect(spy).toHaveBeenCalledWith(
        'user@test.com',
        expect.stringContaining('Добро пожаловать'),
        expect.stringContaining('Ivan'),
      );
    });

    it('sendPaymentSuccess includes plan and amount', async () => {
      const spy = jest.spyOn(service, 'send').mockResolvedValue(false);
      await service.sendPaymentSuccess('user@test.com', 'Pro', '990 ₽');

      expect(spy).toHaveBeenCalledWith(
        'user@test.com',
        expect.stringContaining('Pro'),
        expect.stringContaining('990 ₽'),
      );
    });

    it('sendAiTaskDone includes agent type', async () => {
      const spy = jest.spyOn(service, 'send').mockResolvedValue(false);
      await service.sendAiTaskDone('user@test.com', 'txt2img');

      expect(spy).toHaveBeenCalledWith(
        'user@test.com',
        expect.any(String),
        expect.stringContaining('txt2img'),
      );
    });
  });
});

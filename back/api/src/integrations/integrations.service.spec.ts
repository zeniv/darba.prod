import { Test, TestingModule } from '@nestjs/testing';
import { IntegrationsService } from './integrations.service';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';

describe('IntegrationsService — encrypt/decrypt', () => {
  let service: IntegrationsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        IntegrationsService,
        {
          provide: ConfigService,
          useValue: {
            get: (key: string, def?: string) => {
              if (key === 'ENCRYPTION_KEY') {
                // 32 bytes = 64 hex chars
                return 'a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2';
              }
              return def;
            },
          },
        },
        { provide: PrismaService, useValue: {} },
      ],
    }).compile();

    service = module.get<IntegrationsService>(IntegrationsService);
  });

  it('encrypts and decrypts text correctly', () => {
    const plain = 'sk-test-1234567890abcdef';
    const encrypted = service.encrypt(plain);
    expect(encrypted).not.toBe(plain);
    expect(encrypted).toContain(':'); // iv:data format
    const decrypted = service.decrypt(encrypted);
    expect(decrypted).toBe(plain);
  });

  it('produces different ciphertext each time (random IV)', () => {
    const plain = 'same-token';
    const e1 = service.encrypt(plain);
    const e2 = service.encrypt(plain);
    expect(e1).not.toBe(e2);
    expect(service.decrypt(e1)).toBe(plain);
    expect(service.decrypt(e2)).toBe(plain);
  });

  it('handles empty string', () => {
    const encrypted = service.encrypt('');
    expect(service.decrypt(encrypted)).toBe('');
  });

  it('handles unicode text', () => {
    const plain = 'Bot-API-7123456789:AAHdqTcvCH1vGWJxfSeofSAs0K5PALDsaw';
    const encrypted = service.encrypt(plain);
    expect(service.decrypt(encrypted)).toBe(plain);
  });

  it('throws on invalid encrypted data', () => {
    expect(() => service.decrypt('invalid')).toThrow();
  });
});

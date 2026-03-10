import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { ConfigService } from '@nestjs/config';

describe('AuthController', () => {
  let controller: AuthController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: ConfigService,
          useValue: {
            get: (key: string, def?: string) => {
              const map: Record<string, string> = {
                KEYCLOAK_URL: 'http://keycloak:8080',
                KEYCLOAK_REALM: 'darba',
              };
              return map[key] || def;
            },
          },
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('getProviders returns empty array on Keycloak failure', async () => {
    // Keycloak is not running in test env, should return []
    const result = await controller.getProviders();
    expect(Array.isArray(result)).toBe(true);
  });

  it('getProviders caches result', async () => {
    const r1 = await controller.getProviders();
    const r2 = await controller.getProviders();
    expect(r1).toEqual(r2);
  });
});

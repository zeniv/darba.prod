# Project State — Darba

**Last updated:** 2026-03-10

## Git / CI/CD

- **Repo:** github.com/zeniv/darba.dev
- **Default branch:** dev (development)
- **Stable branch:** main (production, updated via PR + owner approval)
- **CI:** GitHub Actions — lint, typecheck, build on push to dev/main and PRs
- **Deploy:** GitHub Actions — SSH deploy to Yandex Cloud on push to dev (auto), on merged PR to main (after approval)
- **gh CLI:** installed, authenticated as zeniv
- **Latest PR:** #16 (fix: API Dockerfile dist path)

## Production Server (Yandex Cloud)

- **IP:** 89.169.178.103 (static)
- **OS:** Ubuntu 22.04 LTS, 2 vCPU, 8 GB RAM, 40 GB SSD
- **Domain:** darba.pro (DNS at nic.ru DNS-master)
- **SSL:** Let's Encrypt, expires 2026-06-07 (certbot auto-renew cron)
- **Docker:** 29.3.0 + Compose 5.1.0
- **Deploy key:** id_deploy (SSH from GitHub to server)
- All 8 services running via docker compose
- **Last deploy:** 2026-03-10 (PR #13-#16)

## Phase Completion

| Phase | Name | Status |
|-------|------|--------|
| 0 | Infrastructure | DONE |
| 1 | Auth + Basic UI | DONE |
| 2 | Subscriptions + Payments | DONE |
| 3 | AI Agents | DONE |
| 4 | Social Layer | DONE |
| 5 | Full Admin Panel | DONE |
| 6 | Messengers + Integrations | DONE |

## Post-Phase Hardening (DONE)

- Exception filters (AllExceptionsFilter, structured JSON errors)
- File upload validation (Multer configs, 10MB/5MB limits)
- Request logging (RequestLoggerMiddleware, env-based log levels)
- Unit tests (28 tests across 5 suites, all passing)
- VK auto-posting (VkPostingService, shareToVk flag)
- Telegram channel posting (TelegramPostingService, profile UI)
- Social login (Keycloak IdP: Google, VK, Facebook, Apple, Instagram)
- Dynamic login providers (GET /api/auth/providers from Keycloak)
- Detailed health endpoint (/api/health/detailed)
- Rate limiting (@nestjs/throttler)
- Input sanitization (SanitizePipe)
- Email notifications (EmailService + nodemailer)

## First Launch — DONE (2026-03-08)

All 8 Docker services running and responding:

| Service | Container | Port | Status |
|---------|-----------|------|--------|
| PostgreSQL | darba-postgres-1 | 5432 | healthy |
| Redis | darba-redis-1 | 6379 | healthy |
| Keycloak | darba-keycloak-1 | 8080 | 200 |
| AI Worker | darba-ai-worker-1 | — | running |
| API (NestJS) | darba-api-1 | 8000 (internal) | OK, Swagger at /api/docs |
| Frontend (Next.js) | darba-frontend-1 | 3000 (internal) | 200 |
| Nginx | darba-nginx-1 | 80, 443 | 200 |
| pgAdmin | darba-pgadmin-1 | 5050 | 200 |

**DB migration applied:** `20260307000000_init` (15 tables created).

## Build Status

- **NestJS (nest build):** PASS — outputs to dist/src/
- **Next.js (next build):** PASS — 24+ pages
- **AI Worker:** Running (FastAPI + Celery)
- **Docker Compose:** PASS (8 services up)
- **Unit tests:** 28 tests, 5 suites, all passing

## Counts

- **Backend modules:** 13 NestJS modules
- **Backend files:** 60+ TypeScript files
- **Frontend pages:** 24+
- **Frontend components:** 7+ (layout + ui)
- **AI worker tasks:** 5 Python tasks
- **Prisma models:** 15
- **Docker services:** 8 (nginx, frontend, api, ai-worker, keycloak, postgres, redis, pgadmin)

## Docker Launch Strategy

All services via `docker compose up -d --build`.

Production deploy via SSH:
```bash
cd /home/zzzeniv/darba && git pull origin main && docker compose up -d --build --remove-orphans && docker image prune -f
```

Note: API port 8000 not exposed to host — accessed via nginx proxy only.

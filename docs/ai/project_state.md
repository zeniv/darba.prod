# Project State — Darba

**Last updated:** 2026-03-09

## Git / CI/CD

- **Repo:** github.com/zeniv/darba.dev
- **Default branch:** dev (development)
- **Stable branch:** main (production, updated via PR + owner approval)
- **CI:** GitHub Actions — lint, typecheck, build on push to dev/main and PRs
- **Deploy:** GitHub Actions — SSH deploy to Yandex Cloud on push to dev (auto), on merged PR to main (after approval)
- **gh CLI:** installed, authenticated as zeniv

## Production Server (Yandex Cloud)

- **IP:** 89.169.178.103 (static)
- **OS:** Ubuntu 22.04 LTS, 2 vCPU, 8 GB RAM, 40 GB SSD
- **Domain:** darba.pro (DNS at nic.ru DNS-master)
- **SSL:** Let's Encrypt, expires 2026-06-07 (certbot auto-renew cron)
- **Docker:** 29.3.0 + Compose 5.1.0
- **Deploy key:** id_deploy (SSH from GitHub to server)
- All 8 services running via docker compose

## Phase Completion

| Phase | Name | Status |
|-------|------|--------|
| 0 | Infrastructure | DONE |
| 1 | Auth + Basic UI | DONE |
| 2 | Subscriptions + Payments | DONE |
| 3 | AI Agents | DONE |
| 4 | Social Layer | DONE |
| 5 | Full Admin Panel | DONE (wizard pending) |
| 6 | Messengers + Integrations | DONE (auto-posting, mobile pending) |

## First Launch — DONE (2026-03-08)

All 7 Docker services running and responding on `F:\work\code\darba`:

| Service | Container | Port | Status |
|---------|-----------|------|--------|
| PostgreSQL | darba-postgres-1 | 5432 | healthy |
| Redis | darba-redis-1 | 6379 | healthy |
| Keycloak | darba-keycloak-1 | 8080 | 200 |
| AI Worker | darba-ai-worker-1 | — | running |
| API (NestJS) | darba-api | 8000 | OK, Swagger at /api/docs |
| Frontend (Next.js) | darba-frontend | 3000 | 200 |
| Nginx | darba-nginx | 80 | 200 |
| pgAdmin | darba-pgadmin-1 | 5050 | 200 |

**DB migration applied:** `20260307000000_init` (15 tables created).

## Build Status

- **NestJS (tsc -p tsconfig.build.json):** PASS
- **Next.js (next dev --webpack):** PASS — 24 pages
- **AI Worker:** Running (FastAPI + Celery)
- **Docker Compose:** PASS (7 services up)

## Counts

- **Backend modules:** 13 NestJS modules
- **Backend files:** 58 TypeScript files
- **Frontend pages:** 24
- **Frontend components:** 7 (layout + ui)
- **AI worker tasks:** 5 Python tasks
- **Prisma models:** 15
- **Docker services:** 8 (nginx, frontend, api, ai-worker, keycloak, postgres, redis, pgadmin)

## Launch Blockers — ALL RESOLVED

1. ~~Prisma schema missing `url`~~ — removed `url` from schema.prisma (Prisma 7 uses prisma.config.ts)
2. ~~No Prisma migrations~~ — migration `20260307000000_init` created and applied
3. ~~No `.env` file~~ — `back/.env` created from `.env.example`
4. ~~Dockerfile Prisma generate~~ — uses dummy DATABASE_URL at build time
5. ~~NestJS CLI needs @angular-devkit~~ — bypassed with `tsc + node dist/main.js`
6. ~~PrismaClient needs adapter~~ — added `@prisma/adapter-pg` + `pg.Pool`
7. ~~Turbopack panics on Docker volumes~~ — using `--webpack` flag

## Docker Launch Strategy

All services via `docker compose -p darba up -d --build`.

Production deploy via SSH (appleboy/ssh-action):
```bash
cd /home/zzzeniv/darba && git pull origin dev && docker compose -p darba up -d --build --remove-orphans && docker image prune -f
```

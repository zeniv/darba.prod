# Darba — AI Studio

White-label AI portal with social layer and subscription monetization.

## What it does

- AI agents: chat (Claude/GPT), txt-to-image, txt-to-audio, txt-to-video, lipsync
- Social feed: posts, likes, comments, donations, follows
- Subscriptions: token-based plans (Free/Max/Pro), YooKassa + Stripe
- Admin panel: users, CMS, support tickets, settings, analytics
- Integrations: Telegram bot, VK/Telegram auto-posting, user API keys
- Auth: Keycloak SSO + social login (Google, VK, Facebook, Apple, Instagram)

## Tech stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 16, TypeScript, Tailwind, shadcn/ui |
| Backend API | NestJS 11, TypeScript, Prisma 7 |
| AI Worker | Python, FastAPI, Celery |
| Database | PostgreSQL + pgvector |
| Cache/Queue | Redis |
| Auth | Keycloak 23 |
| Infra | Docker Compose, Nginx, GitHub Actions, Yandex Cloud |

## Quick start

```bash
# Clone
git clone git@github.com:zeniv/darba.dev.git
cd darba.dev

# Create env file
cp back/.env.example back/.env
# Edit back/.env with your values

# Start (Windows)
go.bat

# Start (Linux/Mac)
./go.sh
```

### Local URLs

| Service | URL |
|---------|-----|
| Frontend | http://127.0.0.1 |
| API Swagger | http://127.0.0.1/api/docs |
| API Health | http://127.0.0.1/api/health |
| Keycloak Admin | http://127.0.0.1:8080 |
| pgAdmin | http://127.0.0.1:5050 |
| API direct | http://127.0.0.1:8000 |

## Production

- **Server:** Yandex Cloud VPS, Ubuntu 22.04, 2 vCPU, 8 GB RAM
- **Domain:** darba.pro (SSL: Let's Encrypt, auto-renew)
- **Deploy:** push to `dev` → CI; merge PR to `main` → SSH deploy
- **Backups:** PostgreSQL pg_dump daily at 3AM, 7 day retention
- **SMTP:** mail.nic.ru:587 (support@darba.pro)

### Production URLs

| Service | URL |
|---------|-----|
| Frontend | https://darba.pro |
| API Swagger | https://darba.pro/api/docs |
| API Health | https://darba.pro/api/health |
| Keycloak Admin | https://darba.pro/keycloak/ |
| pgAdmin | https://darba.pro/pgadmin/ |

## Project structure

```
darba/
├── front/              # Next.js frontend (24 pages)
├── back/
│   ├── api/            # NestJS backend (13 modules, 15 Prisma models)
│   └── ai-worker/      # Python Celery worker (5 AI tasks)
├── infra/              # nginx, keycloak, postgres configs
├── docs/               # Architecture, roadmap, conventions
├── .github/            # CI/CD workflows (ci.yml, deploy.yml)
└── docker-compose.yml  # 8 services (nginx, frontend, api, ai-worker, keycloak, postgres, redis, pgadmin)
```

## Branches & Remotes

- `dev` — development (default), CI on push
- `main` — stable, deploy on merged PR
- **origin** (darba.dev), **test** (darba.test), **prod** (darba.prod)

## Status

All 6 phases + post-phase hardening complete. 8 Docker services running.
28 unit tests passing. 23 PRs merged. CI fully green.

## License

Proprietary.

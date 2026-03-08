# Darba — AI Studio

White-label AI portal with social layer and subscription monetization.

## What it does

- AI agents: chat (Claude/GPT), txt-to-image, txt-to-audio, txt-to-video, lipsync
- Social feed: posts, likes, comments, donations, follows
- Subscriptions: token-based plans (Free/Max/Pro), YooKassa + Stripe
- Admin panel: users, CMS, support tickets, settings, analytics
- Integrations: Telegram bot, VK OAuth, user API keys

## Tech stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 16, TypeScript, Tailwind, shadcn/ui |
| Backend API | NestJS 11, TypeScript, Prisma 7 |
| AI Worker | Python, FastAPI, Celery |
| Database | PostgreSQL + pgvector |
| Cache/Queue | Redis |
| Auth | Keycloak 23 |
| Infra | Docker Compose, Nginx, GitHub Actions |

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

Services start at:
- Frontend: http://127.0.0.1:3000
- API + Swagger: http://127.0.0.1:8000/api/docs
- Keycloak: http://127.0.0.1:8080
- Nginx: http://127.0.0.1:80

## Project structure

```
darba/
├── front/              # Next.js frontend (24 pages)
├── back/
│   ├── api/            # NestJS backend (13 modules, 15 Prisma models)
│   └── ai-worker/      # Python Celery worker (5 AI tasks)
├── infra/              # nginx, keycloak, postgres configs
├── docs/               # Architecture, roadmap, conventions
└── .github/            # CI/CD workflows
```

## Branches

- `dev` — development (default), auto-deploy on push
- `main` — stable, deploy on merged PR only

## License

Proprietary.

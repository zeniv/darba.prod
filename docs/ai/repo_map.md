# Repository Map — Darba

## Root

```
darba/
├── front/                          # Next.js 16 frontend
├── back/
│   ├── api/                        # NestJS backend API
│   └── ai-worker/                  # Python Celery worker
├── infra/
│   ├── nginx/nginx.conf            # Main nginx config
│   ├── nginx/conf.d/darba.conf     # Upstream routing rules
│   ├── postgres/init.sql           # DB init (pgvector, uuid-ossp)
│   └── keycloak/darba-realm.json   # Keycloak realm import
├── docs/                           # Project documentation
│   ├── architecture.md
│   ├── roadmap.md
│   ├── tech-stack.md
│   ├── integrations.md
│   ├── environments.md
│   └── ai/                         # AI context files (this folder)
├── .github/                        # CI/CD workflows
├── docker-compose.yml              # Production compose
├── docker-compose.dev.yml          # Dev overrides (hot reload, debug)
├── go.bat                          # Windows local start
└── go.sh                           # Linux local start
```

## Backend API — back/api/src/

```
src/
├── main.ts                         # NestJS bootstrap
├── app.module.ts                   # Root module (all imports)
├── app.controller.ts               # Health check
├── prisma/
│   ├── prisma.module.ts            # Global Prisma module
│   └── prisma.service.ts           # PrismaClient + @prisma/adapter-pg
├── auth/
│   ├── auth.module.ts
│   ├── auth.guard.ts               # JWT validation guard (global)
│   └── public.decorator.ts         # @Public() to skip auth
├── users/
│   ├── users.module.ts
│   ├── users.service.ts            # CRUD, findByKeycloakId
│   └── users.controller.ts         # /users endpoints
├── plans/
│   ├── plans.module.ts             # Auto-seeds Free/Max/Pro on init
│   ├── plans.service.ts
│   └── plans.controller.ts         # GET /plans (public)
├── payments/
│   ├── payments.module.ts
│   ├── payments.service.ts         # Orchestrates payment lifecycle
│   ├── payments.controller.ts      # POST /payments, webhooks
│   ├── token.service.ts            # getBalance, deduct, topUp, hasEnough
│   ├── dto/create-payment.dto.ts
│   └── providers/
│       ├── payment-provider.interface.ts
│       ├── yookassa.provider.ts
│       └── stripe.provider.ts
├── ai-gateway/
│   ├── ai-gateway.module.ts
│   ├── ai-gateway.service.ts       # Token check, key passthrough, callbacks
│   ├── ai-gateway.controller.ts    # POST /ai/run, callbacks
│   └── ai-run.dto.ts
├── notifications/
│   ├── notifications.module.ts
│   ├── notifications.service.ts    # DB + WebSocket push
│   ├── notifications.gateway.ts    # Socket.IO at /ws
│   └── notifications.controller.ts # GET/POST notifications
├── storage/
│   ├── storage.module.ts           # Global
│   └── storage.service.ts          # S3/GCS abstraction
├── integrations/
│   ├── integrations.module.ts
│   ├── integrations.service.ts     # AES-256-CBC encrypt/decrypt API keys
│   ├── integrations.controller.ts  # POST/GET/DELETE /integrations/keys
│   ├── social-oauth.service.ts     # VK OAuth flow
│   ├── social-oauth.controller.ts  # /oauth/vk/*, /oauth/connections
│   └── dto/create-integration.dto.ts
├── content/
│   ├── content.module.ts
│   ├── content.service.ts          # Posts CRUD, feeds (public, following)
│   ├── content.controller.ts       # /posts endpoints
│   └── dto/create-post.dto.ts
├── social/
│   ├── social.module.ts
│   ├── social.service.ts           # Likes, comments, follows, donations
│   ├── social.controller.ts        # /social/* endpoints
│   └── dto/social.dto.ts
├── support/
│   ├── support.module.ts
│   ├── support.service.ts          # Tickets CRUD
│   ├── support.controller.ts
│   └── dto/create-ticket.dto.ts
├── telegram/
│   ├── telegram.module.ts
│   ├── telegram.service.ts         # Bot API, webhook, commands
│   └── telegram.controller.ts      # POST /telegram/webhook
└── admin/
    ├── admin.module.ts             # Imports TelegramModule
    ├── admin.guard.ts              # Checks admin role in JWT
    ├── admin.controller.ts         # All /admin/* endpoints
    ├── admin-users.service.ts      # User management, stats
    ├── admin-support.service.ts    # Ticket management
    ├── admin-cms.service.ts        # Pages + menu CRUD
    └── admin-settings.service.ts   # Telegram webhook, MCP, marketing
```

## AI Worker — back/ai-worker/

```
app/
├── __init__.py
├── celery_app.py                   # Celery config (Redis broker)
├── config.py                       # Settings (env vars)
├── callback.py                     # HTTP callbacks to NestJS
├── agents/
│   ├── __init__.py
│   └── base.py                     # Base agent class
└── tasks/
    ├── __init__.py
    ├── chat.py                     # Claude/GPT
    ├── txt2img.py                  # DALL-E/Stability
    ├── txt2audio.py                # ElevenLabs
    ├── txt2video.py                # RunwayML
    └── lipsync.py                  # D-ID
```

## Frontend — front/src/

```
src/
├── middleware.ts                    # /@username routing
├── lib/
│   ├── api.ts                      # API client (apiFetch + all functions)
│   └── utils.ts                    # cn() helper
├── components/
│   ├── providers.tsx               # QueryClientProvider, ThemeProvider
│   ├── layout/
│   │   ├── app-shell.tsx           # Main layout wrapper
│   │   ├── header.tsx
│   │   ├── sidebar.tsx
│   │   ├── cookie-consent.tsx
│   │   └── scroll-to-top.tsx
│   └── ui/
│       └── button.tsx              # shadcn Button
├── app/
│   ├── layout.tsx                  # Root layout
│   ├── page.tsx                    # Home — AI chat interface
│   ├── pricing/page.tsx            # Plans with TanStack Query
│   ├── feed/page.tsx               # Public feed (masonry grid)
│   ├── offer/page.tsx              # Legal
│   ├── disclaimer/page.tsx         # Legal
│   ├── profile/
│   │   ├── page.tsx                # User profile
│   │   ├── payment/page.tsx        # Payment history + balance
│   │   ├── support/page.tsx        # Support tickets
│   │   └── integrations/page.tsx   # Social connections (VK, Telegram)
│   ├── user-profile/[slug]/page.tsx # Public user profile
│   └── admin/
│       ├── layout.tsx              # Admin sidebar layout
│       ├── page.tsx                # Dashboard stats
│       ├── users/page.tsx          # User management
│       ├── users/stat/page.tsx     # Analytics
│       ├── support/page.tsx        # Tickets
│       ├── pages/page.tsx          # CMS pages
│       ├── menu/page.tsx           # Menu tree
│       ├── security/page.tsx       # Security tools
│       └── settings/
│           ├── design/page.tsx     # Branding
│           ├── payments/page.tsx   # Payment provider keys
│           ├── ai/page.tsx         # AI provider keys
│           ├── telegram/page.tsx   # Bot webhook setup
│           └── marketing/page.tsx  # Analytics pixels, UTM, SEO
```

## Config Files

| File | Purpose |
|------|---------|
| back/.env.example | All env vars template |
| back/.env | Local env vars (from .env.example) |
| back/api/prisma/schema.prisma | 15 models, full DB schema (no url in datasource) |
| back/api/prisma.config.ts | Prisma 7 config (datasource.url, migrate.url) |
| back/api/tsconfig.json | noImplicitAny:false, strictNullChecks:true |
| back/api/tsconfig.build.json | Build config (excludes prisma.config.ts) |
| front/next.config.ts | Standalone output, API proxy rewrites |
| docker-compose.yml | 7 services production |
| docker-compose.dev.yml | Dev overrides |
| infra/nginx/conf.d/darba.conf | Reverse proxy rules |
| infra/keycloak/darba-realm.json | Keycloak realm config |
| infra/postgres/init.sql | pgvector + uuid extensions |

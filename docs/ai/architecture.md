# Architecture — Darba

## High-Level

```
[Browser] → [Nginx :80] → [Next.js :3000]  (frontend)
                        → [NestJS :8000]    (API)
                        → [Keycloak :8080]  (auth)

[NestJS] → [PostgreSQL + pgvector]  (data)
         → [Redis]                  (cache + queue broker)
         → [Celery Worker]          (AI tasks, no external port)

[Celery Worker] → [AI APIs: OpenAI, Anthropic, Stability, ElevenLabs, RunwayML, D-ID]
                → HTTP callback → [NestJS /api/ai/callback/*]
```

## Services (docker-compose)

| Service     | Image/Build            | Port  | Purpose                        |
|-------------|------------------------|-------|--------------------------------|
| nginx       | nginx:alpine           | 80,443| Reverse proxy, SSL termination |
| frontend    | front/Dockerfile       | 3000  | Next.js 16 SSR/SSG             |
| api         | back/api/Dockerfile    | 8000  | NestJS REST + WebSocket        |
| ai-worker   | back/ai-worker/Dockerfile | —  | Celery worker (no HTTP)        |
| keycloak    | keycloak:23.0          | 8080  | SSO, OAuth2                    |
| postgres    | pgvector/pgvector:pg16 | 5432  | Primary DB + vector search     |
| redis       | redis:7-alpine         | 6379  | Cache, Bull queue, Celery broker |
| pgadmin     | dpage/pgadmin4         | 5050  | Database management UI         |

## Request Flow — AI Task

1. User sends POST /api/ai/run (agentType, params)
2. NestJS AiGatewayService: check token balance → get user API key → create AiTask row → deduct tokens → enqueue to Bull/Redis
3. Celery worker picks task → calls external AI API → sends HTTP callback to NestJS
4. NestJS callback endpoint: updates AiTask status → sends WebSocket notification to user
5. On failure: tokens refunded, error notification sent

## Auth Flow

1. Frontend redirects to Keycloak login
2. Keycloak authenticates (email/Google/Apple) → returns JWT
3. Frontend sends JWT in Authorization header
4. NestJS AuthGuard validates JWT on every request (@Public() to skip)
5. AdminGuard checks user.roles for admin endpoints

## Payment Flow

1. User selects plan → POST /api/payments {planId, provider}
2. PaymentsService creates payment via YooKassa or Stripe → returns confirmationUrl
3. User pays on provider page → provider sends webhook
4. POST /api/payments/webhook/yookassa (or /stripe) → activatePlan (set planId, planExpiry, add tokens)

## Data Model

15 Prisma models: User, Plan, Payment, Post, Like, Comment, Donation, Follow, AiTask, UserIntegration, Notification, SupportTicket, SupportMessage, Page, MenuItem

## Key Patterns

- **Modular monolith**: NestJS modules loosely coupled, single deployment unit
- **Provider abstraction**: PaymentProvider interface (YooKassa, Stripe implementations)
- **Token economy**: balance-based access to AI, transferable via donations
- **Encryption**: AES-256-CBC for user API keys in NestJS
- **WebSocket**: Socket.IO gateway at /ws namespace, user-scoped rooms
- **Cursor pagination**: public feed uses cursor-based pagination
- **CMS**: admin-managed pages with slug-based upsert, i18n JSON fields

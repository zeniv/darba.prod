# Tasks / Backlog — Darba

## Critical (Launch Blockers) — ALL DONE

- [x] Fix Prisma datasource — Prisma 7 uses prisma.config.ts, not schema.prisma url
- [x] Create initial migration (`20260307000000_init`)
- [x] Create `back/.env` from `.env.example`
- [x] Fix Dockerfile prisma generate (dummy DATABASE_URL at build)
- [x] Docker launch — all 7 services running (2026-03-08)
- [x] PrismaClient adapter — `@prisma/adapter-pg` + `pg.Pool`
- [x] Fix NestJS CLI — bypass with `tsc -p tsconfig.build.json + node dist/main.js`
- [x] Git repo on GitHub (zeniv/darba.dev), SSH key, gh CLI
- [x] CI/CD workflows (ci.yml + deploy.yml)
- [x] Branch strategy: dev (default) + main (stable, PR-only)

## High Priority (Pre-Production)

- [x] End-to-end auth flow (Keycloak OIDC + PKCE, JWKS verification, AuthProvider)
- [x] First launch admin wizard — SetupModule (/api/setup/status + /api/setup/init)
- [x] Seed default CMS pages (offer, privacy, disclaimer via prisma/seed.ts)
- [x] CORS configuration for production domain (CORS_ORIGINS env var)
- [x] HTTPS/SSL setup (nginx + certbot, auto-renew cron)
- [x] Webhook signature verification (Stripe HMAC-SHA256, YooKassa API verify)
- [x] Fix NODE_ENV warning — changed from "local" to "development"

## Medium Priority — ALL DONE

- [x] Auto-posting to social networks (VK wall + Telegram channel, shareToVk/shareToTelegram flags)
- [x] Social login via Keycloak Identity Providers (Google, VK, Facebook, Apple + login page)
- [x] Telegram channel posting (TelegramPostingService, channel config UI)
- [x] Email notifications (EmailService + nodemailer, dry-run without SMTP)
- [x] Rate limiting (@nestjs/throttler: 10/sec, 100/min global; 2/sec, 20/min AI)
- [x] Input sanitization (SanitizePipe strips HTML tags globally)
- [x] File upload size limits and validation (Multer configs + Express body 1MB limit)
- [x] Proper error handling middleware (AllExceptionsFilter, structured JSON errors)
- [x] Write unit tests (28 tests: SanitizePipe, ExceptionFilter, UsersService, SetupController, EmailService)
- [x] Logging framework (NestJS Logger, RequestLoggerMiddleware, env-based log levels)

## Low Priority / Future

- [ ] Mobile app (React Native — separate project)
- [ ] Kafka migration (when >10k DAU)
- [ ] Kubernetes (multi-region)
- [ ] Recommendation system (pgvector similarity search)
- [ ] A/B testing framework
- [ ] White-label onboarding wizard
- [ ] Instagram OAuth integration
- [ ] User Telegram bot (per-user bot instances)
- [x] Monitoring: detailed health endpoint (/api/health/detailed — DB, memory, uptime)

## Done (reference)

See `docs/roadmap.md` for completed items per phase.
See `project_state.md` for launch status.

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
- [ ] Seed default CMS pages (offer, disclaimer)
- [x] CORS configuration for production domain (CORS_ORIGINS env var)
- [x] HTTPS/SSL setup (nginx + certbot, auto-renew cron)
- [x] Webhook signature verification (Stripe HMAC-SHA256, YooKassa API verify)
- [x] Fix NODE_ENV warning — changed from "local" to "development"

## Medium Priority

- [ ] Auto-posting to social networks (VK wall post)
- [ ] Email notifications (SMTP integration in NotificationsService)
- [ ] Rate limiting on API endpoints
- [ ] Input sanitization audit (XSS prevention)
- [ ] File upload size limits and validation
- [ ] Proper error handling middleware (NestJS exception filters)
- [ ] Write unit tests (at least for critical services)
- [ ] Logging framework (replace console with structured logger)

## Low Priority / Future

- [ ] Mobile app (React Native — separate project)
- [ ] Kafka migration (when >10k DAU)
- [ ] Kubernetes (multi-region)
- [ ] Recommendation system (pgvector similarity search)
- [ ] A/B testing framework
- [ ] White-label onboarding wizard
- [ ] Instagram OAuth integration
- [ ] User Telegram bot (per-user bot instances)
- [ ] Monitoring/alerting setup (Cloud Monitoring)

## Done (reference)

See `docs/roadmap.md` for completed items per phase.
See `project_state.md` for launch status.

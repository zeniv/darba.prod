# Project Health — Darba

**Last updated:** 2026-03-09

## Build Status

| Component | Command | Status |
|-----------|---------|--------|
| NestJS API | `tsc -p tsconfig.build.json` | PASS |
| Next.js Frontend | `next dev --webpack` | PASS (24 pages) |
| AI Worker | (Python, no build step) | Running |
| Docker Compose | 8 services | ALL UP |
| Prisma migration | `20260307000000_init` | APPLIED |

## Runtime Status — Local

| Endpoint | URL | Status |
|----------|-----|--------|
| Frontend | http://127.0.0.1:80 | 200 |
| API Health | http://127.0.0.1:80/api/health | OK |
| API Swagger | http://127.0.0.1:80/api/docs | 200 |
| Keycloak | http://127.0.0.1:8080 | 200 |
| pgAdmin | http://127.0.0.1:5050 | 200 |

## Runtime Status — Production (89.169.178.103)

| Endpoint | URL | Status |
|----------|-----|--------|
| Frontend | http://89.169.178.103 | 200 |
| API Swagger | http://89.169.178.103/api/docs | 200 |
| Keycloak | http://89.169.178.103:8080 | 200 |
| pgAdmin | http://89.169.178.103:5050 | 200 |

## Test Coverage

- **Unit tests:** None written yet
- **E2E tests:** None written yet
- **Integration tests:** None written yet

Priority: write tests before production launch.

## Security Audit

- [ ] OWASP top 10 check
- [x] SQL injection — Prisma ORM mitigates (parameterized queries)
- [ ] XSS — need to audit user content rendering in frontend
- [x] CSRF — API uses JWT Bearer tokens (not cookies), low risk
- [x] API key encryption — AES-256-CBC, key from env var
- [ ] Webhook validation — YooKassa/Stripe signature verification needed
- [x] Admin guard — checks JWT roles, works correctly
- [ ] Rate limiting — not implemented yet
- [ ] CORS — needs configuration for production

## Performance

- No load testing done
- Cursor pagination on feed (good for scale)
- pgvector extension ready for future similarity search
- Redis caching infrastructure in place but not actively used
- Celery concurrency=2 (configurable)
- Windows Docker volume I/O is 5-10x slower than native Linux

## Known Issues

1. NODE_ENV="local" causes Next.js warnings (expects "development")
2. Turbopack panics on Docker anonymous volumes — using webpack
3. Docker Desktop ghost containers — using `docker run` instead of compose for app services
4. First page request on frontend takes ~30s (on-demand webpack compile on volume mount)

## Technical Debt

1. No tests at all
2. Webhook signature verification missing (payments)
3. No rate limiting
4. No email notifications (SMTP not wired)
5. Error handling could be more granular (NestJS exception filters)
6. No logging framework (just console)
7. No monitoring/alerting setup
8. HTTPS/SSL not configured (certbot ready, waiting DNS)
9. Keycloak and pgAdmin exposed on public ports without auth proxy

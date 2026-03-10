# Project Health — Darba

**Last updated:** 2026-03-10

## Build Status

| Component | Command | Status |
|-----------|---------|--------|
| NestJS API | `nest build` | PASS (output: dist/src/) |
| Next.js Frontend | `next build` | PASS (24+ pages) |
| AI Worker | (Python, no build step) | Running |
| Docker Compose | 8 services | ALL UP |
| Prisma migration | `20260307000000_init` | APPLIED |
| Unit tests | `npx jest` | 28 tests, 5 suites, ALL PASS |

## Runtime Status — Production (darba.pro / 89.169.178.103)

| Endpoint | URL | Status |
|----------|-----|--------|
| Frontend | https://darba.pro | 200 |
| API Health | https://darba.pro/api/health | OK |
| API Swagger | https://darba.pro/api/docs | 200 |
| Auth Providers | https://darba.pro/api/auth/providers | 200 (dynamic) |
| Login Page | https://darba.pro/login | 200 |
| Keycloak | http://89.169.178.103:8080 | 200 |
| pgAdmin | http://89.169.178.103:5050 | 200 |
| HTTP redirect | http://darba.pro | 301 -> https |

## Test Coverage

- **Unit tests:** 28 tests across 5 suites
  - SanitizePipe (9 tests)
  - AllExceptionsFilter (5 tests)
  - UsersService (5 tests)
  - SetupController (5 tests)
  - EmailService (4 tests)
- **E2E tests:** None written yet
- **Integration tests:** None written yet

## Security Status

- [x] SQL injection — Prisma ORM (parameterized queries)
- [x] XSS — SanitizePipe strips HTML tags globally
- [x] CSRF — API uses JWT Bearer tokens (not cookies), low risk
- [x] API key encryption — AES-256-CBC, key from env var
- [x] Webhook validation — Stripe HMAC-SHA256, YooKassa API verify
- [x] Admin guard — checks JWT roles + isAdmin flag
- [x] Rate limiting — @nestjs/throttler (10/sec, 100/min global)
- [x] CORS — configured via CORS_ORIGINS env var
- [x] HTTPS/SSL — Let's Encrypt, auto-renew, HSTS header
- [x] Body size limits — Express body parser 1MB, Multer 10MB files
- [ ] OWASP top 10 full audit
- [ ] Keycloak/pgAdmin port restriction (currently public)

## Performance

- Cursor pagination on feed (good for scale)
- pgvector extension ready for future similarity search
- Redis caching infrastructure in place
- Celery concurrency=2 (configurable)
- API auth providers cached 5 min
- JWKS public key cached 1 hour

## Known Issues

1. Turbopack panics on Docker anonymous volumes — using webpack for local dev
2. Windows Docker volume I/O is 5-10x slower than native Linux
3. Keycloak and pgAdmin exposed on public ports without auth proxy
4. nest build outputs to dist/src/ (no rootDir in tsconfig) — Dockerfile CMD adjusted

## Technical Debt

1. No E2E / integration tests
2. Email service in dry-run mode (no SMTP configured)
3. Social OAuth tokens stored unencrypted in UserIntegration (TODO in code)
4. Keycloak/pgAdmin exposed on public ports
5. No monitoring/alerting setup (Prometheus/Grafana)
6. No load testing done
7. Docker build cache issues on server (sometimes needs --no-cache)

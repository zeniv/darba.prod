# Scratchpad — Darba

Working notes for current development context.

## Current Focus

First launch done (2026-03-08). Next: auth flow testing, admin wizard, production prep.

## Working Directory

`F:\work\code\darba` — single source of truth.

## Docker Launch Commands

Docker project name: `darba`, network: `darba_darba`.

### Infrastructure (via docker compose)

```bash
cd F:\work\code\darba
docker compose -p darba up -d --no-deps postgres redis
docker compose -p darba up -d --no-deps keycloak
docker compose -p darba up -d --no-deps ai-worker
```

### App Services (via docker run — ghost container workaround)

```bash
# API (NestJS) — pre-built dist/ required
docker run -d --name darba-api \
  --network darba_darba --network-alias api \
  -p 8000:8000 -p 9229:9229 \
  -v "F:/work/code/darba/back/api:/app" \
  -e NODE_ENV=local \
  --env-file "F:/work/code/darba/back/.env" \
  darba-api \
  sh -c "npx prisma migrate deploy && npx prisma generate && node dist/main.js"

# Frontend (Next.js) — webpack mode, anonymous volumes for node_modules/.next
docker run -d --name darba-frontend \
  --network darba_darba --network-alias frontend \
  -p 3000:3000 \
  -v "F:/work/code/darba/front:/app" \
  -v "/app/node_modules" -v "/app/.next" \
  -e NODE_ENV=local \
  darba-frontend \
  sh -c "npm install 2>&1 && npx next dev --webpack"

# Nginx
docker run -d --name darba-nginx \
  --network darba_darba \
  -p 80:80 \
  -v "F:/work/code/darba/infra/nginx/nginx.conf:/etc/nginx/nginx.conf:ro" \
  -v "F:/work/code/darba/infra/nginx/conf.d:/etc/nginx/conf.d:ro" \
  nginx:alpine
```

### Rebuild API after code changes

```bash
# Inside container or via docker run --rm:
docker run --rm -v "F:/work/code/darba/back/api:/app" darba-api \
  sh -c "rm -f dist/tsconfig.build.tsbuildinfo && npx tsc -p tsconfig.build.json"

# Then restart:
docker rm -f darba-api && <run command above>
```

### Stop everything

```bash
docker compose -p darba down --remove-orphans
docker rm -f darba-api darba-frontend darba-nginx
```

## Architecture Decisions Made

- **Monolith over microservices** — single NestJS API for simplicity at this stage
- **Token economy** — flat costs per agent type (chat:1, txt2img:5, txt2audio:10, txt2video:50, lipsync:30)
- **User API keys** — users can bring their own AI provider keys, encrypted with AES-256-CBC
- **Celery over Bull for AI tasks** — Python ecosystem has better AI library support
- **Bull for NestJS internal queues** — keeps TypeScript-side queuing simple
- **Socket.IO for real-time** — WebSocket gateway at /ws, user rooms for targeted notifications
- **@prisma/adapter-pg** — Prisma 7 client engine requires driver adapter, using pg.Pool

## Docker Desktop Windows Gotchas

1. **Ghost containers** — containers enter "Dead" state, can't be removed via `docker rm -f`. Use unique container names, or `docker run` instead of `docker compose` for app services.
2. **Named volumes hang** — `docker run` with named volumes sometimes hangs on Windows. Use anonymous volumes (`-v "/app/node_modules"`) instead.
3. **Volume I/O is slow** — tsc/prisma generate takes 5-10x longer on Windows volume mounts vs native Linux.
4. **Turbopack panics** — Next.js Turbopack crashes reading files from anonymous volumes. Use `--webpack`.
5. **IPv6 curl** — `localhost` resolves to IPv6, Docker port mapping is IPv4. Always use `127.0.0.1`.
6. **node_modules platform** — Windows npm install produces Windows binaries (lightningcss, etc.). Inside Linux container, use anonymous volume from Docker image or run `npm install` in container.
7. **tsbuildinfo stale** — incremental compilation doesn't pick up changes after file edits. Delete `dist/tsconfig.build.tsbuildinfo` before rebuild.

## Known Gotchas (Code)

- shadcn Button does NOT support `asChild` prop — wrap with `<a>` tag instead
- Prisma 7: no `url` in schema.prisma, only prisma.config.ts
- Prisma 7: PrismaClient constructor requires `{ adapter }` (not empty)
- tsconfig.build.json must exclude prisma.config.ts
- nginx strips /api/ prefix when proxying to NestJS
- Keycloak imports realm from /opt/keycloak/data/import/ on first start only
- AI worker tasks expect `user_api_key` as direct param (decrypted in NestJS)
- Next.js 16 "middleware" deprecated -> use "proxy" instead
- NestJS CLI `nest start` requires @angular-devkit/schematics — bypass with tsc + node

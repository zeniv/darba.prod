# Code Conventions — Darba

## General

- Language: TypeScript (backend + frontend), Python (AI worker)
- No emojis in code or responses
- Russian for user-facing text, English for code/comments
- Prefer diffs over full files when showing changes
- Minimal explanations, code-first approach

## Backend (NestJS)

- **Module pattern:** each domain = module + service + controller + DTOs
- **Auth:** Global AuthGuard, skip with `@Public()` decorator
- **Admin:** AdminGuard checks JWT roles for `admin`/`realm-admin` or `user.isAdmin`
- **Validation:** class-validator decorators on DTOs
- **DB access:** PrismaService injected into services
- **Naming:** camelCase for methods/variables, PascalCase for classes/interfaces
- **File naming:** kebab-case (`admin-users.service.ts`)
- **Prisma models:** PascalCase model names, snake_case DB columns via `@@map`/`@map`
- **API prefix:** all routes under `/api/` (nginx strips prefix when proxying)
- **Public webhooks:** `@Public()` on webhook endpoints (payment, telegram)

## Frontend (Next.js)

- **App Router** with `page.tsx` convention
- **Client components:** `"use client"` directive when using hooks/state
- **Data fetching:** TanStack Query (`useQuery`, `useMutation`)
- **Styling:** Tailwind CSS utility classes
- **UI components:** shadcn/ui (customized, no `asChild` prop on Button)
- **API client:** centralized `lib/api.ts` with typed fetch functions
- **State:** zustand for global state, React state for local
- **Theme:** next-themes (dark/light)

## AI Worker (Python)

- **Task pattern:** Celery task receives params + user_api_key → calls AI API → HTTP callback to NestJS
- **No external port:** worker communicates only via Redis queue + HTTP callbacks
- **Config:** pydantic-settings (env vars)
- **Callbacks:** `callback.py` — notify_complete/notify_fail to NestJS

## Database

- **ORM:** Prisma 7 in NestJS with `@prisma/adapter-pg`
- **Prisma config:** `prisma.config.ts` (not `url` in schema.prisma)
- **PrismaService:** extends PrismaClient, constructor uses `new PrismaPg(pool)` adapter
- **Build:** `npx tsc -p tsconfig.build.json` (not `nest build`), exclude prisma.config.ts
- **ID strategy:** UUID v4 (`@default(uuid())`)
- **Timestamps:** `createdAt` + `updatedAt` on all models
- **Unique constraints:** composite uniques for likes, follows, integrations
- **JSON fields:** i18n content (`{ru: "...", en: "..."}`), plan features, metadata

## Docker

- **Multi-stage builds:** development + builder + production stages
- **Dev compose:** volume mounts for hot reload, debug ports exposed
- **Health checks:** postgres (pg_isready), redis (redis-cli ping)
- **Windows:** use `docker run` for app services (ghost container bug), anonymous volumes for node_modules
- **Frontend dev:** `--webpack` flag (Turbopack panics on Docker volumes)
- **API dev:** `tsc -p tsconfig.build.json && node dist/main.js` (nest CLI needs @angular-devkit)
- **Curl:** use `127.0.0.1` not `localhost` (IPv6 issue on Windows)

## Git

- No force pushes to main
- Feature branches for new phases
- Conventional commits preferred

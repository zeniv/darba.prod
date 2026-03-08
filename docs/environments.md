# Окружения и деплой

## Окружения

| Окружение | Ветка git | Домен | Назначение |
|-----------|-----------|-------|-----------|
| `local` | любая | localhost | Разработка на Windows-машине |
| `dev` | `dev` | dev.darba.pro | Разработческий сервер |
| `test` | `test` | test.darba.pro | QA, pen-тесты, нагрузка |
| `prod` | `main` | darba.pro | Продакшн |

---

## Структура переменных окружения

```
back/
├── .env.example      # шаблон с комментариями (в git)
├── .env.local        # локальная (в .gitignore)
├── .env.dev          # dev (в .gitignore)
├── .env.test         # test (в .gitignore)
└── .env.prod         # prod (в .gitignore, секреты через Secret Manager)
```

Все `.env.*` кроме `.env.example` — в `.gitignore`.

### .env.example
```env
# === DATABASE ===
DATABASE_URL=postgresql://user:password@localhost:5432/darba

# === REDIS ===
REDIS_URL=redis://localhost:6379

# === KEYCLOAK ===
KEYCLOAK_URL=http://localhost:8080
KEYCLOAK_REALM=darba
KEYCLOAK_CLIENT_ID=darba-api
KEYCLOAK_CLIENT_SECRET=

# === JWT ===
JWT_SECRET=

# === PAYMENTS ===
YOOKASSA_SHOP_ID=
YOOKASSA_SECRET_KEY=
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=

# === AI PROVIDERS ===
OPENAI_API_KEY=
ANTHROPIC_API_KEY=
STABILITY_API_KEY=
ELEVENLABS_API_KEY=

# === APP ===
NODE_ENV=local
APP_URL=http://localhost:3000
API_URL=http://localhost:8000
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=

# === ENCRYPTION ===
ENCRYPTION_KEY=   # Fernet key для шифрования user API-ключей
```

---

## Docker Compose стратегия

### Базовый (docker-compose.yml)
Содержит определения всех сервисов без environment-специфичных параметров.

### Overrides
- `docker-compose.dev.yml` — volumes для hot reload, debug ports
- `docker-compose.prod.yml` — resource limits, health checks, no volumes

### Запуск по окружению

**Local (Windows):**
```batch
# go.bat
docker-compose -f docker-compose.yml -f docker-compose.dev.yml up -d
pause
```

**Local (Linux/Mac):**
```bash
# go.sh
docker-compose -f docker-compose.yml -f docker-compose.dev.yml up -d
```

**Prod:**
```bash
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d
```

---

## CI/CD Pipeline (GitHub Actions)

```yaml
# Триггеры:
# push → dev   → деплой в dev окружение
# push → test  → деплой в test + авто-тесты
# push → main  → деплой в prod (после approval)
```

### Шаги pipeline:
1. `checkout` — получить код
2. `lint + typecheck` — ESLint, tsc --noEmit
3. `test` — unit + integration тесты
4. `docker build` — собрать образы
5. `push` → Google Artifact Registry
6. `migrate` — Prisma db push / alembic upgrade
7. `deploy` → Cloud Run (или docker-compose на VPS)
8. (только test) `pen-test` → OWASP ZAP scan
9. (только test) `load-test` → k6 сценарии

---

## Защита секретов при деплое

### Dev/Test серверы
- GitHub Secrets → GitHub Actions → SSH → создаёт/обновляет `.env` на сервере
- Существующие переменные НЕ перезаписываются если уже существуют (кроме явного флага)

### Prod (Google Cloud)
- Секреты в Google Secret Manager
- Cloud Run читает их через IAM (нет env файлов на диске)
- Ротация секретов без redeploy

---

## Профили пользователей и конфликт URL

Next.js `middleware.ts` (выполняется на Edge):

```typescript
const RESERVED_PATHS = new Set([
  'admin', 'api', 'auth', 'offer', 'disclaimer',
  'profile', 'feed', 'pricing', 'health', 'static',
  'id', 'tools', '_next', 'favicon.ico'
]);

export function middleware(request: NextRequest) {
  const [, segment] = request.nextUrl.pathname.split('/');
  if (RESERVED_PATHS.has(segment)) {
    // системный роут — пропускаем как есть
    return NextResponse.next();
  }
  if (segment?.startsWith('@') || /^id\d+$/.test(segment)) {
    // пользовательский профиль
    return NextResponse.rewrite(
      new URL(`/user-profile/${segment}`, request.url)
    );
  }
  return NextResponse.next();
}
```

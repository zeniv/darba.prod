# Darba — Архитектура системы

## Обзор

Darba — white-label AI-портал, агрегирующий AI-агентов (txt→img, txt→audio, txt→video, lipsync и др.)
с социальным слоем (лента, лайки, комменты, донаты), подписочной монетизацией и полной кастомизацией.

---

## Сервисы

```
┌─────────────────────────────────────────────────────────────┐
│                         КЛИЕНТ                              │
│              Browser / Mobile App                           │
└───────────────────────┬─────────────────────────────────────┘
                        │ HTTPS
                        ▼
┌─────────────────────────────────────────────────────────────┐
│                       NGINX                                 │
│          Reverse Proxy, SSL termination, роутинг            │
└──────┬──────────────────┬────────────────────────┬──────────┘
       │                  │                        │
       ▼                  ▼                        ▼
┌──────────────┐  ┌──────────────┐      ┌──────────────────┐
│  Next.js 16  │  │  NestJS API  │      │   Keycloak       │
│  (Frontend)  │  │  (порт 8000) │      │   (Auth, 8080)   │
│  порт 3000   │  │  Модульный   │      │   SSO, OAuth2    │
└──────────────┘  │  монолит     │      └──────────────────┘
                  └──────┬───────┘
                         │
              ┌──────────┼──────────┐
              ▼          ▼          ▼
┌─────────────────┐ ┌──────────┐ ┌──────────────────────────┐
│   PostgreSQL    │ │  Redis   │ │     AI Worker            │
│   (порт 5432)   │ │ (6379)   │ │  FastAPI + Celery        │
│   + pgvector    │ │ Cache    │ │  Python AI ecosystem     │
│                 │ │ Sessions │ │  LangChain, HuggingFace  │
│                 │ │ Queues   │ │  MCP SDK                 │
│                 │ │ Streams  │ └──────────────────────────┘
└─────────────────┘ └──────────┘
```

---

## Модули NestJS (back/api)

| Модуль | Ответственность |
|--------|----------------|
| `users` | Профили, аккаунты, интеграции пользователя |
| `auth` | JWT валидация Keycloak-токенов (JWKS RS256, 1h кэш), PKCE S256 |
| `content` | Публикации, галерея, медиафайлы |
| `social` | Лайки, комменты, подписки, донаты |
| `payments` | Тарифы, ЮКасса, Stripe, история платежей, webhook верификация |
| `plans` | Тарифные планы (Free/Max/Pro), auto-seed при запуске |
| `ai-gateway` | Приём AI-запросов → запись в Redis-очередь, callbacks |
| `notifications` | WebSocket уведомления (Socket.IO), email (nodemailer) |
| `integrations` | API-ключи (AES-256-CBC), VK OAuth, Telegram posting, VK posting |
| `support` | Тикеты поддержки (user + admin) |
| `telegram` | Telegram бот, webhook, команды |
| `storage` | S3/GCS абстракция для медиафайлов |
| `setup` | Первый запуск — wizard создания admin-аккаунта |
| `admin` | Управление системой, CRM, поддержка, аналитика |

---

## AI Worker (back/ai-worker)

FastAPI + Celery. Не имеет внешнего HTTP-порта. Читает задачи из Redis-очереди.

**Поток выполнения AI-задачи:**
```
1. Пользователь → NestJS POST /api/ai/run
2. NestJS → Redis queue: {task_id, agent_type, params, user_id}
3. Celery worker → забирает задачу
4. Worker → вызывает AI API (OpenAI, Anthropic, Stability, etc.)
5. Worker → сохраняет результат в PostgreSQL
6. Worker → Redis Streams: notify task_id done
7. NestJS → WebSocket push к клиенту
```

**Поддерживаемые агенты (расширяется):**
- `chat` — Claude / GPT диалог
- `txt2img` — Stable Diffusion / DALL-E
- `txt2audio` — ElevenLabs / Edge-TTS
- `txt2video` — RunwayML / Kling
- `img2video` — RunwayML
- `lipsync` — D-ID / HeyGen
- `custom` — пользовательский агент с API-ключом

---

## База данных

**PostgreSQL** — основная БД.
**pgvector** — векторные эмбеддинги для семантического поиска по контенту.

Схема управляется через **Prisma** (NestJS).

---

## Роутинг URL

| Путь | Тип | Описание |
|------|-----|----------|
| `/` | Системный | Главная: AI-чат + публичная лента |
| `/feed` | Системный | Публичная галерея работ |
| `/pricing` | Системный | Тарифы |
| `/offer` | Системный | Оферта |
| `/disclaimer` | Системный | Дисклаймер |
| `/profile` | Системный | Профиль авторизованного юзера |
| `/profile/payment` | Системный | История платежей |
| `/admin/*` | Системный | Панель управления |
| `/@username` | Пользователь | Публичный профиль |
| `/id{number}` | Пользователь | Профиль по числовому ID |

Next.js middleware разруливает конфликты между зарезервированными путями и пользовательскими именами.

---

## Окружения

| Окружение | Назначение |
|-----------|-----------|
| `local` | Локальная разработка (Windows, go.bat) |
| `dev` | Dev-сервер (Linux, автодеплой из ветки dev) |
| `test` | Тестовый (pen-тесты, нагрузочные тесты) |
| `prod` | Продакшн (darba.pro) |

---

## Внешние интеграции

### Системные (настраиваются в /admin)
- **Keycloak** — авторизация (SSO, OIDC, PKCE S256)
- **Social Login** — Google, VK, Facebook, Apple, Instagram (Keycloak IdPs, динамически)
- **ЮКасса** — платежи RU (webhook HMAC верификация)
- **Stripe** — платежи EU (webhook SHA-256 верификация)
- **AI провайдеры** — OpenAI, Anthropic, Stability AI, ElevenLabs, RunwayML, D-ID
- **Telegram** — системный бот для уведомлений + постинг в канал

### Пользовательские (настраиваются в профиле)
- Свои AI API-ключи (шифрование AES-256-CBC)
- Telegram бот / канал для постинга
- VK OAuth + автопостинг на стену
- Аккаунты соцсетей (OAuth)

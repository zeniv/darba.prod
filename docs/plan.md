Контекст

Darba — AI-портал (белая метка / white-label SaaS), агрегирующий AI-агентов и инструменты
(txt>img, txt>audio, txt>video, lipsync и др.) с социальным слоем (лента, лайки, комменты, донаты),
подписочной моделью и полной кастомизацией брендинга. Развёртывается как коробочный продукт.

1. Технологический стек
Frontend

Next.js 14 (App Router, TypeScript) — SSR/SSG, SEO, файловый роутинг
Tailwind CSS + shadcn/ui — современный дизайн, тёмная/светлая тема из коробки
Zustand — глобальный state management
TanStack Query — data fetching, кэш, infinite scroll
next-intl — полная i18n (все языки мира)
Socket.io client — real-time уведомления, чат

Backend

NestJS (Node.js/TypeScript) — единственный API-сервер, модульный монолит
FastAPI + Celery (Python) — AI-воркер (только async задачи, нет внешнего API)
Prisma ORM + миграции — NestJS управляет схемой БД
Celery + Redis — очереди для долгих AI-задач (генерация видео/аудио/изображений)

Базы данных

PostgreSQL — основная БД
Redis — кэш + Celery broker + сессии
pgvector (расширение PG) — векторные эмбеддинги для AI-поиска

Авторизация

Keycloak — как указано в брифе, SSO, OAuth2, PKCE

Брокер сообщений

Kafka — для высоконагруженных событий (аналитика, AI-задачи, уведомления)
Redis Celery — для быстрых задач

Инфраструктура

Docker + Docker Compose — все сервисы в контейнерах
Nginx — reverse proxy, роутинг (замена .htaccess)
GitHub Actions — CI/CD
Google Cloud Run — деплой
Google Cloud SQL (PostgreSQL) — managed DB для prod


2. Архитектура: Монолит vs Микросервисы
Решение: Модульный монолит (NestJS) + выделенный AI-воркер (FastAPI/Celery)
Обоснование:

NestJS — единственный API-сервер: все бизнес-запросы, auth, content, social, payments, admin
Модули NestJS: users, content, social, payments, admin, notifications, analytics — чёткие границы, без service mesh
Для AI-задач NestJS записывает задание в Redis-очередь > FastAPI AI-воркер (Celery) забирает и выполняет
FastAPI НЕ является отдельным API — это только асинхронный воркер. Python нужен для: LangChain, HuggingFace, MCP Python SDK
Результат AI-задачи сохраняется в БД, NestJS отдаёт его клиенту через WebSocket/polling

Сервисы в Docker Compose:
nginx        > роутинг, SSL (порт 80/443)
frontend     > Next.js (порт 3000)
api          > NestJS (порт 8000) — единственный API
ai-worker    > FastAPI + Celery (AI-задачи, нет внешнего порта)
keycloak     > авторизация (порт 8080)
postgres     > БД (порт 5432)
redis        > кэш + Celery broker + Redis Streams (порт 6379)

3. URL-структура (решение конфликта user vs system routes)
Решение: Профили пользователей — /@username / /id{number}, системные страницы — стандартные читаемые URL без префикса.
Профили:      /@ivan  |  /id765878785
Системные:    /offer  /disclaimer  /profile  /profile/payment  /feed  /pricing
Admin:        /admin/*
API (внутр.): /api/*
Auth:         /auth/*
Зарезервировано (не могут быть username): admin, api, auth, offer, disclaimer,
  profile, feed, pricing, health, static, id, tools
Next.js App Router: app/[username]/page.tsx — middleware проверяет username на зарезервированность, если совпадает — отдаёт системный роут, иначе — профиль пользователя.

4. Окружения (Environments)
local > .env.local
dev   > .env.dev
test  > .env.test
prod  > .env.prod
Реализация через python-decouple + Docker Compose override-файлы:

docker-compose.yml — base
docker-compose.dev.yml — override для dev
docker-compose.prod.yml — override для prod

Секреты НЕ хранятся в git — только .env.example шаблоны. При выкатке переменные мигрируют через GitHub Secrets > env-файл на сервере.

5. Платежи

Россия: ЮКасса (YooKassa) — самый надёжный, API простой
Европа: Stripe — стандарт де-факто
Интерфейс PaymentProvider — абстракция, выбор провайдера из /admin/settings


6. AI-агенты и MCP

Роутер агентов: единый endpoint POST /api/ai/run принимает {agent_type, params}
Поддержка: OpenAI, Anthropic Claude, Stability AI, ElevenLabs, RunwayML, D-ID (lipsync)
MCP-серверы: через mcp Python SDK
Пользовательские агенты: юзер вводит API-ключ в профиле > шифруется в БД (Fernet)


7. Kafka и Redis — необходимость
Redis: Обязательно — Celery broker, кэш страниц, rate limiting, сессии.
Redis Streams (старт): Заменяет Kafka на MVP-этапе. Потоки событий:

stream:analytics — пользовательские события (клики, просмотры)
stream:notifications — уведомления
stream:audit — аудит-лог

Kafka: Добавить при достижении >10k DAU или нескольких consumer group. Переход прозрачный — меняем только producer/consumer, бизнес-логика не затрагивается.

8. Kubernetes
Решение: Нет на старте, добавить при росте
Обоснование:

Google Cloud Run обеспечивает автомасштабирование без K8s
K8s оправдан при 10+ репликах сервисов и/или complex orchestration
Добавить при достижении 10k+ DAU или необходимости multi-region


9. CI/CD
GitHub Actions:
  push > main: деплой в prod
  push > dev:  деплой в dev
  push > test: деплой в test + запуск pen-тестов (OWASP ZAP) + нагрузочных (k6)

Деплой:
  - Docker build > Google Artifact Registry
  - Cloud Run deploy
  - DB migration (Alembic)

10. Безопасность

Pen-тесты: OWASP ZAP (из admin-панели > API trigger > результат в /admin/security)
Нагрузочное тестирование: k6
Rate limiting: Redis + nginx
CORS, CSP headers
Secrets: Google Secret Manager


11. Структура проекта
darba/
+-- front/                    # Next.js 14 (TypeScript)
¦   L-- app/
¦       +-- [username]/       # профили: /@ivan (middleware разруливает)
¦       +-- offer/            # /offer
¦       +-- disclaimer/       # /disclaimer
¦       +-- profile/          # /profile, /profile/payment
¦       +-- pricing/          # /pricing
¦       +-- feed/             # /feed
¦       L-- admin/            # /admin (отдельный layout)
+-- back/
¦   +-- api/                  # NestJS — единственный API (модульный монолит)
¦   ¦   +-- src/
¦   ¦   ¦   +-- users/
¦   ¦   ¦   +-- content/
¦   ¦   ¦   +-- social/
¦   ¦   ¦   +-- payments/
¦   ¦   ¦   +-- notifications/
¦   ¦   ¦   L-- admin/
¦   ¦   L-- prisma/           # schema + миграции
¦   L-- ai-worker/            # FastAPI + Celery (воркер, нет внешнего API)
¦       L-- app/
¦           +-- agents/       # AI-агенты (txt2img, txt2video, lipsync...)
¦           +-- tasks/        # Celery задачи
¦           L-- mcp/          # MCP-серверы
+-- infra/                    # nginx, keycloak конфиги
+-- docs/                     # архитектура, ADR
+-- .github/                  # CI/CD workflows
+-- back/.env                 # (gitignored)
+-- docker-compose.yml        # base
+-- docker-compose.dev.yml
+-- docker-compose.prod.yml
+-- go.bat                    # Windows локальный запуск
L-- go.sh                     # Linux локальный запуск

12. Этапы разработки (MVP > v1)
Этап 0 — Инфраструктура (1-2 недели)

 Структура репозитория, .env шаблоны, docker-compose
 Keycloak + PostgreSQL + Redis поднять локально
 Nginx конфиг, базовый роутинг
 GitHub Actions — CI pipeline

Этап 1 — Аутентификация + Базовый UI (2-3 недели)

 Next.js проект, базовая вёрстка (адаптивная)
 Keycloak интеграция (вход, регистрация, OAuth Google/Apple)
 NestJS skeleton + FastAPI AI-сервис skeleton, Swagger у обоих
 Cookie banner, тёмная/светлая тема, i18n (RU/EN)

Этап 2 — Подписки и платежи (2 недели)

 Тарифные планы (Free/Max/Pro)
 ЮКасса + Stripe интеграция
 Баланс токенов, история платежей

Этап 3 — AI-агенты (3-4 недели)

 Роутер агентов, очереди Celery
 Первый агент: chat (Claude/GPT)
 txt>img (Stable Diffusion / DALL-E)
 Пользовательские API-ключи

Этап 4 — Социальный слой (2-3 недели)

 Публикации, лента (главная)
 Лайки, комменты, донаты
 Профили пользователей

Этап 5 — Админка (2-3 недели)

 /admin (базовые разделы: users, support, menu, settings)
 Маркетинговый модуль, аналитика
 Управление тарифами и контентом

Этап 6 — Мессенджеры и интеграции (2 недели)

 Telegram bot интеграция
 Соцсети OAuth


13. Документация в /docs
Файлы для создания:

architecture.md — общая архитектура
monolith-vs-microservices.md — обоснование выбора
tech-stack.md — стек с обоснованием
api-design.md — принципы API
environments.md — окружения и деплой
integrations.md — все интеграции
roadmap.md — план этапов


Согласованные решения

Backend: NestJS — модульный монолит (единственный API) + FastAPI/Celery — AI-воркер
Frontend: Next.js 14
Профили: /@username и /id{number}
Системные страницы: /offer, /disclaimer, /profile, /profile/payment (без префикса)
Брокер: Redis Streams > Kafka при масштабировании
go.bat: Windows локально, сервер Linux (go.sh)
K8s: нет на старте, Cloud Run + Docker Compose
Платежи: ЮКасса (RU) + Stripe (EU)


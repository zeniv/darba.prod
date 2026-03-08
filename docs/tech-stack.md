# Tech Stack — обоснование

## Frontend: Next.js 14

**Почему Next.js:**
- App Router — серверные компоненты снижают JS-бандл, улучшают Core Web Vitals
- SSR/SSG из коробки — критично для SEO публичных профилей и ленты
- Файловый роутинг = структура директорий = документация проекта
- TypeScript нативно
- Образ Docker < 200MB (standalone output)
- Middleware на Edge — идеально для разруливания `/@username` vs системных роутов

**Альтернативы и почему отклонены:**
- Vite + React SPA — нет SSR из коробки, сложнее SEO
- Nuxt/Vue — меньше экосистема, меньше AI-UI библиотек
- SvelteKit — меньше сообщество, меньше UI-компонентов для сложных SaaS

**UI:**
- **Tailwind CSS** — утилитарный CSS, минимальный бандл, hover/dark из коробки
- **shadcn/ui** — копируются компоненты в проект (нет зависимости от npm-пакета), полная кастомизация
- **Framer Motion** — анимации (infinite scroll gallery, transitions)

**State:**
- **Zustand** — минимальный бойлерплейт, нет Provider hell, DevTools
- **TanStack Query** — серверный стейт, кэш, infinite queries для галереи

**i18n:**
- **next-intl** — ICU format, RSC-совместимый, namespace-организация переводов

---

## Backend: NestJS

**Почему NestJS:**
- TypeScript-монолит — консистентность с Next.js (одна кодовая база языка)
- Модульная архитектура встроена (декораторы, DI)
- Guards + Interceptors = чистая JWT-валидация из Keycloak
- WebSocket модуль из коробки (для уведомлений)
- Swagger (@nestjs/swagger) — автогенерация документации
- Bull Queue (@nestjs/bull) — Redis-очереди для AI-задач

**ORM: Prisma**
- Type-safe запросы без кодогенерации runtime
- Migrations из коробки
- Prisma Studio для дебаггинга данных
- Поддержка PostgreSQL + pgvector расширений

---

## AI Worker: FastAPI + Celery

**Почему Python для AI:**
- LangChain — оркестрация LLM, цепочки, RAG
- HuggingFace Transformers — локальные модели
- anthropic, openai, stability-sdk — официальные Python SDK
- MCP Python SDK — официальный, Node.js SDK менее зрелый
- Celery — стандарт де-факто для Python async задач

**Celery конфигурация:**
- Broker: Redis
- Result backend: Redis (+ PostgreSQL для долгосрочного хранения)
- Concurrency: prefork для CPU-задач, gevent для IO-задач

---

## База данных: PostgreSQL + pgvector

**PostgreSQL:**
- ACID-гарантии для транзакций (платежи)
- JSONB — гибкие AI-параметры без изменения схемы
- Full-text search через ts_vector
- Поддержка большинства cloud-провайдеров

**pgvector:**
- Векторный поиск по эмбеддингам контента
- Семантический поиск в галерее
- Рекомендательная система (похожие работы)

---

## Auth: Keycloak

- OpenID Connect + OAuth2
- PKCE flow для SPA
- Social login: Google, Apple (и другие)
- User federation (LDAP при необходимости)
- Admin REST API для управления пользователями из /admin
- Brute-force защита встроена

---

## Кэш и очереди: Redis

| Использование | Механизм |
|--------------|---------|
| Session кэш | Redis String (TTL) |
| AI-задачи очередь | Celery (Redis List) |
| Rate limiting | Redis Counter + INCR |
| Real-time события | Redis Streams |
| Страничный кэш | Redis String (TTL) |
| Pub/Sub | Redis Pub/Sub → WebSocket |

---

## Инфраструктура

| Компонент | Технология | Обоснование |
|-----------|-----------|-------------|
| Контейнеры | Docker + Compose | Стандарт, локальная разработка |
| Reverse proxy | Nginx | Роутинг, SSL, статика, gzip |
| CI/CD | GitHub Actions | Нативная интеграция GitHub |
| Хостинг | Google Cloud Run | Serverless контейнеры, автомасштабирование |
| БД prod | Google Cloud SQL | Managed PostgreSQL, автобэкапы |
| Секреты prod | Google Secret Manager | Нет секретов в env файлах на сервере |
| Мониторинг | Google Cloud Monitoring | Нативная интеграция с Cloud Run |

---

## Платежи

| Регион | Провайдер | Причина |
|--------|-----------|---------|
| Россия | ЮКасса | Лидер рынка, простой API, ФЗ-54 |
| Европа | Stripe | Стандарт де-факто, отличный API |

Абстракция `PaymentProvider` — переключение провайдера в `/admin/settings` без изменения кода.

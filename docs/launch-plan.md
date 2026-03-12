# Plan: Darba Launch Roadmap (Go-To-Market)

## Context

Darba -- AI-портал (white-label SaaS). Код и инфраструктура готовы: 6 фаз разработки + hardening DONE.
8 Docker-сервисов на darba.pro, 23 PR, 28 тестов, CI green, SMTP подключен.
Осталось: настроить внешние сервисы, наполнить контентом, допилить TODO в коде, протестировать, запуститься.

---

## Фаза 1: Бизнес-решения (Евгений)

> Определить стратегию до любой технической работы.

### 1.1 Тарифные планы
- [ ] Определить тарифы (название, цена, лимит токенов, фичи)
  - Пример: Free (0 руб, 100 токенов/мес, только chat), Max (990 руб/мес, 5000 токенов, все агенты), Pro (2490 руб/мес, безлимит)
- [ ] Определить стоимость токенов по каждому AI-агенту (chat=1, img=5, audio=10, video=50, lipsync=30)
- [ ] Определить валюту (RUB основная, USD для Stripe)
- [ ] Годовая подписка со скидкой? (поле `period` в модели Plan есть)

### 1.2 Структура меню
- [ ] Определить пункты главного меню и их порядок
  - Пример: Главная, AI-чат, Генерация изображений, Аудио, Видео, Липсинк, Лента, Тарифы
- [ ] Какие пункты видны только платным? (MenuItem поддерживает planIds)
- [ ] Нужны ли вложенные пункты?

### 1.3 CMS-контент
- [ ] Текст главной страницы (hero, описание сервиса)
- [ ] FAQ / Помощь (CMS-страница или отдельная?)
- [ ] Актуализировать Оферту, Политику, Дисклеймер (сейчас заглушки)

### 1.4 Маркетинг
- [ ] Google Analytics (GA4) -- получить ID G-XXXXXXXXXX
- [ ] Яндекс.Метрика -- получить ID
- [ ] UTM-ссылки для каналов
- [ ] Каналы привлечения (Telegram, VK, SEO, контекст)
- [ ] Open Graph теги (og:title, og:image)

---

## Фаза 2: Регистрация внешних сервисов и получение ключей (Евгений)

### 2.1 Платежные системы
- [ ] **YooKassa**: магазин -> `YOOKASSA_SHOP_ID` + `YOOKASSA_SECRET_KEY`
  - Webhook: `https://darba.pro/api/payments/webhook/yookassa`
- [ ] **Stripe** (EU, опционально): `STRIPE_SECRET_KEY` + `STRIPE_WEBHOOK_SECRET` + `STRIPE_PUBLISHABLE_KEY`
  - Webhook: `https://darba.pro/api/payments/webhook/stripe`

### 2.2 AI-провайдеры
- [ ] **OpenAI** -> `OPENAI_API_KEY` (GPT-4o, DALL-E 3)
- [ ] **Anthropic** -> `ANTHROPIC_API_KEY` (Claude)
- [ ] **Stability AI** -> `STABILITY_API_KEY` (Stable Diffusion)
- [ ] **ElevenLabs** -> `ELEVENLABS_API_KEY` (TTS)
- [ ] **RunwayML** -> `RUNWAYML_API_KEY` (видео)
- [ ] **D-ID** -> `DID_API_KEY` (липсинк)

### 2.3 Соцсети для входа (OAuth credentials)
- [ ] **Google**: OAuth2 клиент в Google Cloud Console -> clientId + clientSecret
- [ ] **VK**: приложение в VK Dev -> clientId + clientSecret
- [ ] **Facebook**: приложение в Meta Developers -> clientId + clientSecret
- [ ] **Apple**: Sign In with Apple -> clientId + teamId + keyId + privateKey
- [ ] **Instagram**: через Facebook App -> clientId + clientSecret

### 2.4 Telegram
- [ ] Бот через @BotFather -> `TELEGRAM_BOT_TOKEN`
- [ ] Канал для анонсов (опционально)

### 2.5 S3-хранилище (для медиа AI)
- [ ] Yandex Object Storage / S3 -> `S3_ENDPOINT`, `S3_ACCESS_KEY`, `S3_SECRET_KEY`, `S3_BUCKET`

### 2.6 Мониторинг (опционально)
- [ ] Sentry -> DSN (error tracking)
- [ ] UptimeRobot / Yandex Monitoring

---

## Фаза 3: Конфигурация Keycloak (Евгений + Claude)

> https://darba.pro/keycloak/ (admin/admin -> сменить пароль!)

### 3.1 Базовая настройка
- [ ] Сменить admin-пароль
- [ ] Проверить realm `darba`
- [ ] Проверить client `darba-frontend` (public, PKCE)
- [ ] Проверить client `darba-api` (confidential)

### 3.2 Включение социальных IdP
- [ ] Для каждого (Google, VK, Facebook, Apple, Instagram):
  1. Identity Providers -> выбрать
  2. Ввести clientId + clientSecret
  3. Enabled = ON
  4. Скопировать redirect URI в консоль провайдера

### 3.3 Роли и пользователи
- [ ] Проверить роли: `admin`, `manager`, `support`, `user`
- [ ] Создать администратора (или через /api/setup/init wizard)
- [ ] Настроить Email в Realm Settings (для восстановления паролей)

---

## Фаза 4: Внесение ключей в .env на проде (Claude)

> После получения всех ключей от Евгения

- [ ] AI: `OPENAI_API_KEY`, `ANTHROPIC_API_KEY`, `STABILITY_API_KEY`, `ELEVENLABS_API_KEY`, `RUNWAYML_API_KEY`, `DID_API_KEY`
- [ ] Платежи: `YOOKASSA_SHOP_ID`, `YOOKASSA_SECRET_KEY`, `STRIPE_*`
- [ ] S3: `S3_ENDPOINT`, `S3_ACCESS_KEY`, `S3_SECRET_KEY`, `S3_BUCKET`, `S3_REGION`
- [ ] Telegram: `TELEGRAM_BOT_TOKEN`
- [ ] Keycloak: `KEYCLOAK_CLIENT_SECRET` (если обновился)
- [ ] `docker compose up -d api ai-worker` для перезапуска

---

## Фаза 5: Наполнение контента (Евгений через Admin + Claude)

### 5.1 Тарифы
- [ ] Claude: seed-скрипт или admin API для создания тарифов
- [ ] Евгений: проверить отображение на /pricing

### 5.2 Меню
- [ ] Евгений: создать пункты через /admin/menu
- [ ] Проверить sidebar

### 5.3 CMS-страницы
- [ ] Обновить Оферту, Политику, Дисклеймер через /admin/pages
- [ ] Создать FAQ, "О нас" если нужно

### 5.4 Маркетинг
- [ ] Ввести GA4 и Метрику в /admin/settings/marketing

---

## Фаза 6: Доработки кода (Claude)

### 6.1 Критичные TODO
- [ ] `front/src/app/page.tsx` -- подключить реальный POST /api/ai/run (сейчас mock)
- [ ] `front/src/app/profile/payment/page.tsx` -- реальные данные (сейчас mock)
- [ ] `front/src/app/profile/support/page.tsx` -- подключить к API (сейчас mock)
- [ ] `back/api/src/storage/storage.service.ts` -- S3 pre-signed URL (TODO)
- [ ] `back/ai-worker/app/tasks/txt2audio.py` -- S3 upload (сейчас placeholder)

### 6.2 Желательные
- [ ] Sentry SDK (NestJS + Next.js)
- [ ] CSP заголовки в nginx
- [ ] Meta/OG теги на всех страницах
- [ ] Favicon и PWA manifest
- [ ] 404/500 стилизованные страницы
- [ ] Loading states и skeleton screens
- [ ] Реальная статистика на /admin dashboard

---

## Фаза 7: Тестирование (Евгений + Claude)

### 7.1 Функциональное
- [ ] Регистрация + вход (email + каждый соцлогин)
- [ ] Покупка тарифа (YooKassa тестовый режим)
- [ ] Каждый AI-агент (chat, img, audio, video, lipsync)
- [ ] Соц. действия (пост, лайк, коммент, фолоу, донат)
- [ ] Админка (users, тикеты, CMS, меню)
- [ ] Email-уведомления (welcome, payment, AI done)
- [ ] Telegram-уведомления

### 7.2 Безопасность
- [ ] Сменить все дефолтные пароли (Keycloak admin, pgAdmin, JWT_SECRET, ENCRYPTION_KEY)
- [ ] Проверить что .env не коммитится
- [ ] OWASP ZAP scan (опционально)

### 7.3 Нагрузочное (опционально)
- [ ] k6 / ab -- базовый тест (100 concurrent)

---

## Фаза 8: Запуск

### 8.1 Предзапуск
- [ ] YooKassa: тестовый -> боевой режим
- [ ] Финальный деплой: `docker compose up -d --build`
- [ ] Проверить все endpoints
- [ ] Проверить бэкапы (pg_dump вручную)

### 8.2 День запуска
- [ ] Опубликовать в Telegram-канале
- [ ] VK-группа (если есть)
- [ ] Включить аналитику
- [ ] Мониторить логи 24ч

### 8.3 Первая неделя
- [ ] Мониторить ошибки (Sentry/логи)
- [ ] Собирать feedback
- [ ] Фиксить баги
- [ ] Трекать конверсию регистрация -> оплата

---

## Порядок и зависимости

| # | Что | Кто | Блокирует |
|---|-----|-----|-----------|
| 1 | Бизнес-решения (тарифы, меню, контент) | Евгений | Все остальное |
| 2 | Регистрация внешних сервисов, получение ключей | Евгений | Фазы 3-4 |
| 3 | Конфигурация Keycloak | Евгений + Claude | Тестирование входа |
| 4 | Внесение ключей в .env | Claude | Тестирование AI/платежей |
| 5 | Доработки кода (TODO) | Claude | Тестирование |
| 6 | Наполнение контента | Евгений через Admin | Запуск |
| 7 | Тестирование | Евгений + Claude | Запуск |
| 8 | Launch | Вместе | -- |

Фазы 1-2 параллельно. Фазы 3-6 параллельно после получения ключей.

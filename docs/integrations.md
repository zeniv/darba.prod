# Интеграции системы

## Системные интеграции (управляются в /admin)

### 1. Авторизация — Keycloak

- **Конфиг:** `/admin/settings/auth`
- **Протокол:** OpenID Connect, OAuth2, PKCE
- **Социальный вход:** Google, Apple (настраивается в Keycloak Identity Providers)
- **Управление пользователями:** Admin REST API → NestJS читает/создаёт/блокирует юзеров
- **JWT валидация:** NestJS Guard проверяет токен через Keycloak JWKS endpoint

### 2. Платежи — ЮКасса (Россия)

- **Конфиг:** `/admin/settings/payments` → поле credentials из файла
- **API:** REST, webhooks
- **Поддерживаемые методы:** карты, ЮMoney, SBP, Тинькофф Pay
- **ФЗ-54:** чеки генерируются автоматически
- **Webhook:** `POST /api/payments/yookassa/webhook`

### 3. Платежи — Stripe (Европа)

- **Конфиг:** `/admin/settings/payments`
- **API:** REST + Stripe SDK
- **Методы:** карты, SEPA, Apple Pay, Google Pay
- **Webhook:** `POST /api/payments/stripe/webhook`
- **Абстракция:** интерфейс `IPaymentProvider` — переключение провайдера без изменения кода

### 4. AI-провайдеры (системные API-ключи)

| Провайдер | Возможности | Конфиг |
|-----------|-------------|--------|
| Anthropic Claude | chat, анализ | `/admin/settings/ai` |
| OpenAI GPT | chat, txt→img (DALL-E) | `/admin/settings/ai` |
| Stability AI | txt→img, img→img | `/admin/settings/ai` |
| ElevenLabs | txt→audio, клонирование голоса | `/admin/settings/ai` |
| RunwayML | txt→video, img→video | `/admin/settings/ai` |
| D-ID / HeyGen | lipsync | `/admin/settings/ai` |

### 5. MCP-серверы

- **Протокол:** Model Context Protocol (Anthropic)
- **Реализация:** Python MCP SDK в AI-воркере
- **Управление:** список MCP-серверов в `/admin/settings/mcp`
- **Типы:** filesystem, database, browser, custom

---

## Пользовательские интеграции (управляются в профиле юзера)

### 1. Кастомные AI-агенты

Пользователь подключает свои API-ключи:
- OpenAI, Anthropic, или любой OpenAI-совместимый API
- Ключ шифруется Fernet (Python) перед сохранением в БД
- При выполнении задачи воркер расшифровывает ключ в памяти

**Endpoint:** `POST /api/user/integrations/ai`
```json
{
  "provider": "openai",
  "api_key": "sk-...",
  "model": "gpt-4o"
}
```

### 2. Telegram

- **Настройка:** `/profile/integrations/telegram`
- **Схема:** пользователь создаёт Telegram-бота через @BotFather → вставляет токен
- **Хранение токена:** зашифровано Fernet в БД
- **Конфиг бота:** управляется в `/admin/settings/telegram` (для системного бота)
- **Возможности:** уведомления об AI-результатах, запуск агентов через бот
- **Реализация:** python-telegram-bot в AI-воркере

**Пользовательский бот endpoint:** `POST /api/user/integrations/telegram`

### 3. Социальные сети (OAuth)

Пользователь авторизует свои аккаунты для:
- Публикации контента из Darba
- Импорта аудитории (будущий функционал)

| Соцсеть | OAuth scope | Действие |
|---------|-------------|---------|
| VK | `wall`, `photos` | Публикация постов/фото |
| Instagram | `content_publish` | Публикация медиа |
| TikTok | `video.upload` | Загрузка видео |
| YouTube | `youtube.upload` | Загрузка видео |

**Хранение:** OAuth refresh-токены зашифрованы Fernet.

---

## Интеграции для аналитики и маркетинга

### Маркетинговый модуль (управляется в /admin/users/stat)

- **Пиксели:** Meta Pixel, Google Tag Manager — вставка через `/admin/settings/marketing`
- **UTM-tracking:** автоматический парсинг UTM-параметров, запись в профиль пользователя
- **Look-alike:** экспорт аудиторий в форматах для Meta/Google Ads
- **CRM:** экспорт пользователей в CSV / webhook

### Redis Streams для аналитики

```
stream:analytics → события {user_id, event, props, timestamp}
```

Консьюмер: NestJS analytics module агрегирует в PostgreSQL для `/admin/users/stat`.

---

## Решение для email-уведомлений

- **SMTP:** Postmark / SendGrid / Mailgun (настраивается в `/admin/settings/email`)
- **Шаблоны:** управляются в `/admin/settings/email/templates`
- **Типы:** регистрация, оплата, сброс пароля, уведомления

---

## Безопасность интеграций

1. **Все API-ключи** хранятся зашифрованными (Fernet, ключ в env)
2. **Webhook endpoints** верифицируют подписи (HMAC)
3. **OAuth токены** — только refresh-токены в БД, access-токены только в памяти
4. **Rate limiting** на все интеграционные endpoints

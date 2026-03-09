# Plan: Social Login (Keycloak IdP) + Telegram Channel Posting

## Part 1: Social Login via Keycloak Identity Providers

### Шаг 1. Custom Keycloak image (VK provider)
- Создать `infra/keycloak/Dockerfile`:
  - FROM quay.io/keycloak/keycloak:23.0
  - Скачать JAR keycloak-russian-providers (v1.x) в /opt/keycloak/providers/
  - CMD: start-dev --import-realm
- Обновить `docker-compose.yml`: keycloak service -> build from Dockerfile вместо image

### Шаг 2. Realm config — Identity Providers
- Обновить `infra/keycloak/darba-realm.json` -> добавить 4 IdP:
  - **google** (встроенный): clientId/clientSecret из env
  - **facebook** (встроенный): clientId/clientSecret из env
  - **apple** (встроенный): clientId/teamId/keyId/privateKey из env
  - **vk** (custom SPI): clientId/clientSecret из env
- Каждый IdP:
  - alias: google/facebook/apple/vk
  - providerId: google/facebook/apple/vk (SPI для VK)
  - enabled: true
  - firstBrokerLoginFlowAlias: "first broker login"
  - trustEmail: true (для Google/Apple)
  - config: clientId, clientSecret (placeholder, настраивается через Admin UI)
- Добавить identityProviderMappers для маппинга email/name в Keycloak атрибуты

### Шаг 3. Frontend — login() с kc_idp_hint
- `front/src/lib/auth.ts`:
  - Новая функция `loginWith(provider: 'google' | 'vk' | 'facebook' | 'apple')`
  - Добавляет `kc_idp_hint={provider}` к auth URL — Keycloak сразу редиректит к IdP
  - Старый login() без hint — показывает стандартную форму Keycloak

### Шаг 4. Frontend — кнопки социального логина
- `front/src/app/login/page.tsx` (новая страница):
  - 4 кнопки: Google, VK, Facebook, Apple (стилизованные иконки/цвета)
  - Кнопка "Войти по email" — обычный login() (форма Keycloak)
  - Каждая кнопка -> loginWith(provider)
- `front/src/components/layout/header.tsx`:
  - Кнопка "Войти" ведёт на /login вместо прямого login()

### Шаг 5. Env vars
- `.env.example`: добавить переменные для IdP credentials (справочно)
  - KEYCLOAK_IDP_GOOGLE_CLIENT_ID, KEYCLOAK_IDP_GOOGLE_CLIENT_SECRET
  - KEYCLOAK_IDP_FACEBOOK_CLIENT_ID, KEYCLOAK_IDP_FACEBOOK_CLIENT_SECRET
  - KEYCLOAK_IDP_APPLE_CLIENT_ID, KEYCLOAK_IDP_APPLE_TEAM_ID, KEYCLOAK_IDP_APPLE_KEY_ID
  - VK_CLIENT_ID, VK_CLIENT_SECRET (уже есть)
- Реальные ключи настраиваются через Keycloak Admin UI (realm -> Identity Providers)

---

## Part 2: Telegram Channel Posting

### Шаг 6. TelegramPostingService (бэкенд)
- Новый файл `back/api/src/integrations/telegram-posting.service.ts`:
  - `postToChannel(userId, text, imageUrl?)` — отправка в канал юзера
  - `testConnection(botToken, channelId)` — проверка связи (getChat + sendMessage "test")
  - `isConnected(userId)` — проверка наличия конфига
  - Читает botToken + channelId из UserIntegration (type='social', provider='telegram_channel')
  - Bot API: sendMessage, sendPhoto

### Шаг 7. Endpoints для Telegram канала
- Добавить в `SocialOAuthController` (или новый контроллер):
  - POST `/integrations/telegram-channel` — сохранить botToken + channelId
  - POST `/integrations/telegram-channel/test` — тестовое сообщение
  - DELETE `/integrations/telegram-channel` — отключить
- Данные хранятся в UserIntegration: type='social', provider='telegram_channel'
  - encryptedKey = botToken (зашифровать через IntegrationsService)
  - metadata = { channelId }

### Шаг 8. ContentController — shareToTelegram
- `CreatePostDto`: добавить `shareToTelegram?: boolean`
- `ContentController.create()`: fire-and-forget shareToTelegram аналогично shareToVk
- `shareToTelegram()`: формирует текст, отправляет через TelegramPostingService

### Шаг 9. Frontend — настройка Telegram канала
- Обновить `front/src/app/profile/integrations/page.tsx`:
  - Добавить секцию "Telegram-канал" с полями: Bot Token, Channel ID
  - Кнопки: Подключить, Тестировать, Отключить
  - Инструкция: как создать бота через @BotFather, как добавить бота в канал

### Шаг 10. Module updates
- IntegrationsModule: добавить TelegramPostingService
- ContentModule: уже импортирует IntegrationsModule, нужно только добавить в constructor

---

## Файлы для создания/изменения

### Новые файлы:
1. `infra/keycloak/Dockerfile`
2. `front/src/app/login/page.tsx`
3. `back/api/src/integrations/telegram-posting.service.ts`

### Изменяемые файлы:
4. `docker-compose.yml` — keycloak build вместо image
5. `infra/keycloak/darba-realm.json` — identityProviders
6. `front/src/lib/auth.ts` — loginWith(provider)
7. `front/src/components/layout/header.tsx` — ссылка на /login
8. `back/api/src/integrations/integrations.module.ts` — TelegramPostingService
9. `back/api/src/content/content.controller.ts` — shareToTelegram
10. `back/api/src/content/dto/create-post.dto.ts` — shareToTelegram flag
11. `front/src/app/profile/integrations/page.tsx` — Telegram channel UI
12. `back/.env.example` — IdP env vars

# Roadmap — Darba

## Этап 0: Инфраструктура

**Результат:** Всё запускается локально командой go.bat

- [x] Структура репозитория
- [x] Документация /docs
- [x] docker-compose.yml (base)
- [x] docker-compose.dev.yml
- [x] docker-compose.prod.yml
- [x] go.bat (Windows) + go.sh (Linux)
- [x] .env.example
- [x] Nginx конфиг (роутинг, проксирование)
- [x] Keycloak конфигурация (realm, clients)
- [x] PostgreSQL init scripts
- [x] GitHub Actions CI (lint, typecheck, test)
- [x] .gitignore

---

## Этап 1: Аутентификация + Базовый UI

**Результат:** Можно зайти на сайт, зарегистрироваться, залогиниться

- [x] Next.js 14 проект (App Router, TypeScript, Tailwind, shadcn/ui)
- [x] Базовый layout: шапка, левое меню, центр
- [x] Тёмная/светлая тема (next-themes)
- [x] Cookie consent banner
- [x] i18n базовый (RU + EN)
- [x] Страница входа (Keycloak redirect)
- [x] Страница регистрации (email, Google, Apple)
- [x] NestJS проект skeleton (все модули, Swagger)
- [x] FastAPI AI-воркер skeleton (Celery, health check)
- [x] Prisma schema v1 (users, sessions)
- [x] JWT Guard в NestJS

---

## Этап 2: Подписки и Платежи

**Результат:** Пользователь может купить тариф и получить доступ

- [x] Тарифные планы в БД (Free/Max/Pro — настраиваются)
- [x] Страница /pricing
- [x] Интеграция ЮКасса (создание платежа, webhook)
- [x] Интеграция Stripe (создание платежа, webhook)
- [x] Баланс токенов на аккаунте
- [x] Страница /profile/payment (история, чеки)
- [x] Тикеты в поддержку (user side)
- [ ] /admin/settings/payments

---

## Этап 3: AI-Агенты

**Результат:** Пользователь может общаться с AI и генерировать контент

- [x] AI-Gateway в NestJS (POST /api/ai/run)
- [x] Celery задачи в AI-воркере
- [x] WebSocket уведомления о готовности задачи
- [x] Агент: chat (Claude / GPT)
- [x] Агент: txt→img (Stable Diffusion / DALL-E)
- [x] Агент: txt→audio (ElevenLabs)
- [x] Хранение результатов в БД + S3/GCS
- [x] Пользовательские API-ключи (шифрование, подключение)
- [ ] /admin/settings/ai (API-ключи системы)

---

## Этап 4: Социальный слой

**Результат:** Публичная лента работ, профили, взаимодействие

- [x] Публикации (создать, редактировать, удалить)
- [x] Приватность публикации (открытая/закрытая)
- [x] Публичная лента / (Pinterest-стиль, infinite scroll)
- [x] Лайки
- [x] Комменты
- [x] Донаты (tip) между пользователями
- [x] Профиль пользователя /@username
- [x] Подписки (follow/unfollow)
- [x] Лента подписок
- [x] Уведомления (real-time WebSocket)

---

## Этап 5: Полная Админка

**Результат:** Полное управление системой через /admin

- [x] /admin/users — список, фильтры, действия
- [x] /admin/users/stat — аналитика, воронки
- [x] /admin/support — тикеты, история, статусы
- [x] /admin/menu — управление меню и страницами
- [x] /admin/settings/front_design — кастомизация UI
- [x] /admin/settings/payments — платёжные системы
- [x] /admin/settings/ai — AI-провайдеры
- [x] /admin/settings/marketing — пиксели, UTM
- [x] /admin/security — pen-тест запуск, результаты
- [x] Ролевая модель (admin, manager, support)
- [ ] Первый запуск — wizard создания admin-аккаунта

---

## Этап 6: Мессенджеры и Доп. Интеграции

**Результат:** Уведомления в Telegram, публикация в соцсети

- [x] Системный Telegram-бот (уведомления)
- [x] /admin/settings/telegram — настройка webhook
- [x] OAuth соцсетей (VK OAuth flow)
- [x] /profile/integrations — подключение соцсетей
- [x] MCP-серверы (конфигурация в admin)
- [ ] Публикация контента в соцсети (автопостинг)
- [ ] Мобильное приложение (отдельный проект, React Native)

---

## Технический долг / будущее

- [ ] Kafka (при >10k DAU)
- [ ] Kubernetes (при multi-region)
- [ ] Рекомендательная система (pgvector)
- [ ] A/B тестирование
- [ ] White-label onboarding wizard

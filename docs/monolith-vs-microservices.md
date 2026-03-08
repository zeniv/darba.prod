# Monolith vs Microservices — обоснование выбора

## Решение: Модульный монолит + выделенный AI-воркер

---

## Почему не чистые микросервисы

### Операционная сложность
Каждый микросервис требует:
- Отдельный Dockerfile, CI/CD pipeline
- Service discovery (Consul / k8s Service)
- Distributed tracing (Jaeger, Zipkin)
- Centralized logging (ELK / Loki)
- Inter-service authentication
- Distributed transactions (Saga pattern)

Для стартапа/MVP это означает в 3–4x больше времени на DevOps до первой рабочей фичи.

### Сложность дебаггинга
Трассировка запроса через 5–7 сервисов требует distributed tracing инфраструктуры.
В монолите — один стектрейс, один лог.

### Latency
Внутрисервисные вызовы через HTTP/gRPC добавляют 1–10ms на каждый hop.
Для синхронных операций (показать профиль пользователя) это критично.

---

## Почему не чистый монолит

Одна кодовая база (NestJS) для AI-задач не подходит по причине:

1. **Экосистема Python** — LangChain, HuggingFace Transformers, MCP Python SDK, Celery — нет адекватного аналога в Node.js
2. **Ресурсная изоляция** — AI-задачи могут занимать 100% CPU/GPU. Если они в одном процессе с API, это блокирует обработку HTTP-запросов
3. **Масштабирование** — AI-воркеры масштабируются независимо от API (например, 1 API-сервер + 5 AI-воркеров)

---

## Выбранная архитектура

```
┌─────────────────────────────────┐    ┌──────────────────────────┐
│   NestJS — модульный монолит    │    │   FastAPI + Celery       │
│                                 │    │   AI-воркер (Python)     │
│   Модули:                       │    │                          │
│   - users                       │◄──►│   Задачи:                │
│   - content                     │    │   - txt→img              │
│   - social                Redis │    │   - txt→video            │
│   - payments         ─────queue─┼───►│   - lipsync              │
│   - ai-gateway                  │    │   - chat                 │
│   - notifications               │◄───┼── results                │
│   - admin                       │    │                          │
└─────────────────────────────────┘    └──────────────────────────┘
```

**Коммуникация:** Redis очереди (не HTTP). Нет network overhead для AI-задач.

---

## Путь к микросервисам

При необходимости (>10k DAU, команда 10+ человек) модули NestJS легко выносятся в отдельные сервисы:

1. **Извлечение модуля** → отдельный NestJS сервис
2. **Добавление message broker** → замена in-process вызовов на Kafka-события
3. **Service discovery** → добавить Kubernetes/Consul

Бизнес-логика при этом не переписывается — только транспортный слой.

---

## Когда добавить Kafka

| Условие | Действие |
|---------|---------|
| >10k DAU | Перейти с Redis Streams на Kafka |
| >3 consumer group на один поток | Kafka обязателен |
| Multi-region деплой | Kafka + MirrorMaker |
| Нужен event sourcing | Kafka + Kafka Streams |

---

## Kubernetes — нужен ли?

**Нет на старте.** Google Cloud Run обеспечивает:
- Автомасштабирование (0 → N инстансов)
- Rolling deploys
- Health checks
- Нет оверхеда управления кластером

**Добавить K8s при:**
- Необходимость stateful workloads (ML-модели локально)
- Multi-region active-active
- >20 подов в кластере
- Сложные networking требования (service mesh)

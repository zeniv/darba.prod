-- Darba PostgreSQL Init Script
-- Выполняется при первом запуске контейнера

-- Создаём базу данных для Keycloak (если не существует)
SELECT 'CREATE DATABASE keycloak OWNER darba'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'keycloak')\gexec

-- Подключаемся к основной БД darba
\connect darba;

-- Включаем расширение pgvector для семантического поиска
CREATE EXTENSION IF NOT EXISTS vector;

-- Включаем расширение для UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Включаем полнотекстовый поиск (встроен в PG, но явно указываем локаль)
-- Prisma создаст все таблицы через миграции

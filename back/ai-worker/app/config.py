from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    # Redis / Celery
    redis_url: str = "redis://redis:6379"

    # Database
    database_url: str = "postgresql+asyncpg://darba:darba@postgres:5432/darba"

    # Encryption
    encryption_key: str = ""

    # AI Providers (system keys)
    anthropic_api_key: str = ""
    openai_api_key: str = ""
    stability_api_key: str = ""
    elevenlabs_api_key: str = ""
    runwayml_api_key: str = ""
    did_api_key: str = ""

    # NestJS API (internal network)
    api_internal_url: str = "http://api:8000"

    # Telegram
    telegram_bot_token: str = ""

    # Storage
    s3_endpoint: str = ""
    s3_bucket: str = "darba-media"
    s3_access_key: str = ""
    s3_secret_key: str = ""
    s3_region: str = "auto"

    class Config:
        env_file = "/app/.env"
        extra = "ignore"


settings = Settings()

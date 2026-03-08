"""
Базовые типы и утилиты для AI-агентов
"""
from pydantic import BaseModel
from app.config import settings


class AgentResult(BaseModel):
    task_id: str
    status: str  # "done" | "error"
    output: str  # Текстовый результат или URL
    media_url: str | None = None  # URL медиафайла в S3


def decrypt_api_key(encrypted_key: str) -> str:
    """Расшифровывает API-ключ пользователя (Fernet)."""
    from cryptography.fernet import Fernet

    if not settings.encryption_key:
        raise ValueError("ENCRYPTION_KEY not set")

    f = Fernet(settings.encryption_key.encode())
    return f.decrypt(encrypted_key.encode()).decode()


def encrypt_api_key(plain_key: str) -> str:
    """Шифрует API-ключ пользователя (вызывается из NestJS через POST /api/user/integrations)."""
    from cryptography.fernet import Fernet

    if not settings.encryption_key:
        raise ValueError("ENCRYPTION_KEY not set")

    f = Fernet(settings.encryption_key.encode())
    return f.encrypt(plain_key.encode()).decode()

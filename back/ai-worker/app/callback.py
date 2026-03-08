"""
Callback to NestJS API when AI tasks complete or fail.
The AI worker calls the internal API endpoint to update task status
and trigger WebSocket notifications.
"""
import httpx
from app.config import settings


API_BASE = settings.api_internal_url.rstrip("/")


def notify_complete(task_id: str, result: str, media_url: str | None = None) -> None:
    """Notify NestJS that a task completed successfully."""
    try:
        httpx.post(
            f"{API_BASE}/api/ai/callback/complete",
            json={"taskId": task_id, "result": result, "mediaUrl": media_url},
            timeout=10,
        )
    except Exception:
        pass  # Best-effort — task result is already stored


def notify_fail(task_id: str, error: str) -> None:
    """Notify NestJS that a task failed."""
    try:
        httpx.post(
            f"{API_BASE}/api/ai/callback/fail",
            json={"taskId": task_id, "error": error},
            timeout=10,
        )
    except Exception:
        pass

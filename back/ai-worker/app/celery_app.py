from celery import Celery
from app.config import settings

celery_app = Celery(
    "darba-ai-worker",
    broker=settings.redis_url,
    backend=settings.redis_url,
    include=[
        "app.tasks.chat",
        "app.tasks.txt2img",
        "app.tasks.txt2audio",
        "app.tasks.txt2video",
        "app.tasks.lipsync",
    ],
)

celery_app.conf.update(
    task_serializer="json",
    accept_content=["json"],
    result_serializer="json",
    timezone="UTC",
    enable_utc=True,
    task_track_started=True,
    task_acks_late=True,
    worker_prefetch_multiplier=1,  # Одна задача за раз (AI-задачи тяжёлые)
    task_routes={
        "app.tasks.chat.*": {"queue": "chat"},
        "app.tasks.txt2img.*": {"queue": "media"},
        "app.tasks.txt2audio.*": {"queue": "media"},
        "app.tasks.txt2video.*": {"queue": "media"},
        "app.tasks.lipsync.*": {"queue": "media"},
    },
)

"""
Text-to-Audio AI task (ElevenLabs и др.)
"""
import logging

from app.celery_app import celery_app
from app.agents.base import AgentResult
from app.config import settings
from app.callback import notify_complete, notify_fail
from app.s3 import upload_bytes, generate_key

logger = logging.getLogger(__name__)


@celery_app.task(bind=True, name="app.tasks.txt2audio.run_txt2audio", queue="media")
def run_txt2audio(
    self,
    task_id: str,
    text: str,
    voice_id: str = "21m00Tcm4TlvDq8ikWAM",  # ElevenLabs Rachel
    provider: str = "elevenlabs",
    user_api_key: str | None = None,
    user_id: str = "",
) -> dict:
    try:
        if provider == "elevenlabs":
            audio_url = _elevenlabs(text, voice_id, user_api_key, user_id)
        else:
            raise ValueError(f"Unknown provider: {provider}")

        notify_complete(task_id, audio_url, media_url=audio_url)

        return AgentResult(
            task_id=task_id,
            status="done",
            output=audio_url,
            media_url=audio_url,
        ).model_dump()

    except Exception as exc:
        notify_fail(task_id, str(exc))
        self.update_state(state="FAILURE", meta={"error": str(exc)})
        raise


def _elevenlabs(text: str, voice_id: str, api_key: str | None, user_id: str) -> str:
    from elevenlabs.client import ElevenLabs

    client = ElevenLabs(api_key=api_key or settings.elevenlabs_api_key)
    audio_chunks = b"".join(
        chunk
        for chunk in client.text_to_speech.convert(
            voice_id=voice_id,
            text=text,
            model_id="eleven_multilingual_v2",
        )
    )

    key = generate_key(user_id or "anonymous", "txt2audio", "mp3")
    audio_url = upload_bytes(audio_chunks, key, content_type="audio/mpeg")

    if audio_url is None:
        logger.warning("S3 not configured — returning placeholder for task audio")
        return "audio_url_placeholder"

    return audio_url

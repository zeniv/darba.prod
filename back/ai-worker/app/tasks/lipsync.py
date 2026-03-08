"""
Lipsync AI task (D-ID / HeyGen)
"""
from app.celery_app import celery_app
from app.agents.base import AgentResult
from app.config import settings
from app.callback import notify_complete, notify_fail


@celery_app.task(bind=True, name="app.tasks.lipsync.run_lipsync", queue="media")
def run_lipsync(
    self,
    task_id: str,
    image_url: str,
    audio_url: str | None = None,
    text: str | None = None,
    voice_id: str | None = None,
    provider: str = "did",
    user_api_key: str | None = None,
) -> dict:
    """
    Создаёт видео с синхронизацией губ.
    Принимает либо audio_url, либо text+voice_id для синтеза речи.
    """
    try:
        if provider == "did":
            video_url = _did_lipsync(image_url, audio_url, text, voice_id, user_api_key)
        else:
            raise ValueError(f"Unknown provider: {provider}")

        notify_complete(task_id, video_url, media_url=video_url)

        return AgentResult(
            task_id=task_id,
            status="done",
            output=video_url,
            media_url=video_url,
        ).model_dump()

    except Exception as exc:
        notify_fail(task_id, str(exc))
        self.update_state(state="FAILURE", meta={"error": str(exc)})
        raise


def _did_lipsync(
    image_url: str,
    audio_url: str | None,
    text: str | None,
    voice_id: str | None,
    api_key: str | None,
) -> str:
    import httpx
    import base64
    import time

    api_key = api_key or settings.did_api_key
    headers = {
        "Authorization": f"Basic {base64.b64encode(f'{api_key}:'.encode()).decode()}",
        "Content-Type": "application/json",
    }

    script = {}
    if audio_url:
        script = {"type": "audio", "audio_url": audio_url}
    elif text:
        script = {
            "type": "text",
            "input": text,
            "provider": {"type": "elevenlabs", "voice_id": voice_id or "21m00Tcm4TlvDq8ikWAM"},
        }

    response = httpx.post(
        "https://api.d-id.com/talks",
        headers=headers,
        json={
            "source_url": image_url,
            "script": script,
        },
        timeout=30,
    )
    response.raise_for_status()
    talk_id = response.json()["id"]

    for _ in range(60):
        time.sleep(5)
        status_resp = httpx.get(
            f"https://api.d-id.com/talks/{talk_id}",
            headers=headers,
            timeout=10,
        )
        data = status_resp.json()
        if data["status"] == "done":
            return data["result_url"]
        elif data["status"] == "error":
            raise RuntimeError(f"D-ID error: {data.get('description', 'unknown')}")

    raise TimeoutError("D-ID lipsync timed out")

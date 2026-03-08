"""
Text-to-Video AI task (RunwayML и др.)
"""
from app.celery_app import celery_app
from app.agents.base import AgentResult
from app.config import settings
from app.callback import notify_complete, notify_fail


@celery_app.task(bind=True, name="app.tasks.txt2video.run_txt2video", queue="media")
def run_txt2video(
    self,
    task_id: str,
    prompt: str,
    duration: int = 5,
    provider: str = "runwayml",
    user_api_key: str | None = None,
) -> dict:
    try:
        if provider == "runwayml":
            video_url = _runwayml(prompt, duration, user_api_key)
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


def _runwayml(prompt: str, duration: int, api_key: str | None) -> str:
    import httpx
    import time

    headers = {
        "Authorization": f"Bearer {api_key or settings.runwayml_api_key}",
        "Content-Type": "application/json",
    }
    response = httpx.post(
        "https://api.runwayml.com/v1/image_to_video",
        headers=headers,
        json={
            "promptText": prompt,
            "duration": duration,
            "ratio": "1280:768",
        },
        timeout=30,
    )
    response.raise_for_status()
    runway_task_id = response.json()["id"]

    for _ in range(60):  # max 5 min
        time.sleep(5)
        status_resp = httpx.get(
            f"https://api.runwayml.com/v1/tasks/{runway_task_id}",
            headers=headers,
            timeout=10,
        )
        data = status_resp.json()
        if data["status"] == "SUCCEEDED":
            return data["output"][0]
        elif data["status"] == "FAILED":
            raise RuntimeError(f"RunwayML task failed: {data.get('failure', 'unknown')}")

    raise TimeoutError("RunwayML task timed out")

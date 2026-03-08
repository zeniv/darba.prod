"""
Text-to-Image AI task
"""
from app.celery_app import celery_app
from app.agents.base import AgentResult
from app.config import settings
from app.callback import notify_complete, notify_fail


@celery_app.task(bind=True, name="app.tasks.txt2img.run_txt2img", queue="media")
def run_txt2img(
    self,
    task_id: str,
    prompt: str,
    negative_prompt: str = "",
    provider: str = "openai",
    model: str | None = None,
    width: int = 1024,
    height: int = 1024,
    user_api_key: str | None = None,
) -> dict:
    """Генерирует изображение по текстовому описанию."""
    try:
        if provider == "openai":
            image_url = _dalle(prompt, model, user_api_key, width, height)
        elif provider == "stability":
            image_url = _stability(prompt, negative_prompt, user_api_key, width, height)
        else:
            raise ValueError(f"Unknown provider: {provider}")

        notify_complete(task_id, image_url, media_url=image_url)

        return AgentResult(
            task_id=task_id,
            status="done",
            output=image_url,
            media_url=image_url,
        ).model_dump()

    except Exception as exc:
        notify_fail(task_id, str(exc))
        self.update_state(state="FAILURE", meta={"error": str(exc)})
        raise


def _dalle(prompt: str, model: str | None, api_key: str | None, width: int, height: int) -> str:
    from openai import OpenAI

    client = OpenAI(api_key=api_key or settings.openai_api_key)
    size = f"{width}x{height}"
    response = client.images.generate(
        model=model or "dall-e-3",
        prompt=prompt,
        size=size,
        quality="standard",
        n=1,
    )
    return response.data[0].url


def _stability(prompt: str, negative_prompt: str, api_key: str | None, width: int, height: int) -> str:
    import httpx

    headers = {
        "Authorization": f"Bearer {api_key or settings.stability_api_key}",
        "Content-Type": "application/json",
        "Accept": "application/json",
    }
    response = httpx.post(
        "https://api.stability.ai/v2beta/stable-image/generate/sd3",
        headers=headers,
        json={
            "prompt": prompt,
            "negative_prompt": negative_prompt,
            "width": width,
            "height": height,
            "output_format": "png",
        },
        timeout=60,
    )
    response.raise_for_status()
    return response.json().get("image", "")

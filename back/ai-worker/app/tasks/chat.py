"""
Chat AI task — работает с Claude и GPT
"""
from app.celery_app import celery_app
from app.config import settings
from app.agents.base import AgentResult, decrypt_api_key
from app.callback import notify_complete, notify_fail


@celery_app.task(bind=True, name="app.tasks.chat.run_chat", queue="chat")
def run_chat(
    self,
    task_id: str,
    messages: list[dict],
    provider: str = "anthropic",
    model: str | None = None,
    user_api_key: str | None = None,
) -> dict:
    """
    Запускает chat-агента.

    Args:
        task_id: ID задачи в БД
        messages: История сообщений [{role, content}]
        provider: "anthropic" | "openai"
        model: Имя модели (None = дефолт провайдера)
        user_api_key: Расшифрованный API-ключ пользователя (передан из NestJS)
    """
    try:
        if provider == "anthropic":
            result = _run_anthropic(messages, model, user_api_key)
        elif provider == "openai":
            result = _run_openai(messages, model, user_api_key)
        else:
            raise ValueError(f"Unknown provider: {provider}")

        notify_complete(task_id, result)

        return AgentResult(
            task_id=task_id,
            status="done",
            output=result,
        ).model_dump()

    except Exception as exc:
        notify_fail(task_id, str(exc))
        self.update_state(state="FAILURE", meta={"error": str(exc)})
        raise


def _run_anthropic(messages: list[dict], model: str | None, api_key: str | None) -> str:
    import anthropic

    client = anthropic.Anthropic(api_key=api_key or settings.anthropic_api_key)
    response = client.messages.create(
        model=model or "claude-opus-4-6",
        max_tokens=4096,
        messages=messages,
    )
    return response.content[0].text


def _run_openai(messages: list[dict], model: str | None, api_key: str | None) -> str:
    from openai import OpenAI

    client = OpenAI(api_key=api_key or settings.openai_api_key)
    response = client.chat.completions.create(
        model=model or "gpt-4o",
        messages=messages,
    )
    return response.choices[0].message.content

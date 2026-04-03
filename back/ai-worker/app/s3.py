"""S3-compatible storage client (Yandex Object Storage / AWS S3)."""
import io
import logging
from typing import BinaryIO

import boto3
from botocore.config import Config as BotoConfig

from app.config import settings

logger = logging.getLogger(__name__)

_client = None


def _get_client():
    global _client
    if _client is not None:
        return _client
    if not settings.s3_endpoint or not settings.s3_access_key:
        logger.warning("S3 not configured, uploads will be skipped")
        return None
    _client = boto3.client(
        "s3",
        endpoint_url=settings.s3_endpoint,
        aws_access_key_id=settings.s3_access_key,
        aws_secret_access_key=settings.s3_secret_key,
        region_name=settings.s3_region,
        config=BotoConfig(signature_version="s3v4"),
    )
    return _client


def upload_bytes(data: bytes, key: str, content_type: str = "application/octet-stream") -> str | None:
    """Upload bytes to S3 and return the public URL. Returns None if S3 not configured."""
    client = _get_client()
    if client is None:
        return None
    client.put_object(
        Bucket=settings.s3_bucket,
        Key=key,
        Body=io.BytesIO(data),
        ContentType=content_type,
    )
    return f"{settings.s3_endpoint}/{settings.s3_bucket}/{key}"


def upload_stream(stream: BinaryIO, key: str, content_type: str = "application/octet-stream") -> str | None:
    """Upload a file-like stream to S3 and return the public URL."""
    client = _get_client()
    if client is None:
        return None
    client.upload_fileobj(
        stream,
        settings.s3_bucket,
        key,
        ExtraArgs={"ContentType": content_type},
    )
    return f"{settings.s3_endpoint}/{settings.s3_bucket}/{key}"


def generate_key(user_id: str, task_type: str, ext: str) -> str:
    import time, random, string
    ts = int(time.time() * 1000)
    rand = "".join(random.choices(string.ascii_lowercase + string.digits, k=6))
    return f"ai-results/{user_id}/{task_type}/{ts}-{rand}.{ext}"

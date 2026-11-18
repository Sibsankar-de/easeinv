from datetime import datetime
from enum import StrEnum
from pydantic import BaseModel, Field


class JobType(StrEnum):
    WEB_BUILDER_STORE_INIT = "WEB_BUILDER_STORE_INIT"
    WEB_BUILDER_STORE_DEVELOP = "WEB_BUILDER_STORE_DEVELOP"


class JobPayload(BaseModel):
    prompt: str


class Job(BaseModel):
    job_id: str
    store_id: str
    type: JobType
    retry_count: int = 0
    max_retries: int = 3
    expiry: datetime | None = None
    payload: JobPayload = Field(default_factory=lambda: JobPayload(prompt=""))

from urllib.parse import quote
from pydantic import computed_field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env", env_file_encoding="utf-8", extra="ignore"
    )

    LOG_LEVEL: str = "INFO"

    SERVER_HOST: str = "127.0.0.1"
    SERVER_PORT: int = 5000

    S3_ENDPOINT_URL: str = "http://localhost:8333"
    S3_ACCESS_KEY_ID: str = "admin"
    S3_SECRET_ACCESS_KEY: str = "secret"
    S3_REGION_NAME: str = "us-east-1"
    S3_BUCKET_NAME: str = "web-builder"

    MCP_SERVER_NAME: str = "web-builder-mcp"

    EXA_API_KEY: str = ""

    QDRANT_HOST: str = "localhost"
    QDRANT_PORT: int = 6333
    QDRANT_GRPC_PORT: int = 6334
    QDRANT_API_KEY: str | None = None
    QDRANT_URL: str | None = None

    RABBITMQ_HOST: str = "localhost"
    RABBITMQ_PORT: int = 5672
    RABBITMQ_USER: str = "admin"
    RABBITMQ_PASSWORD: str = "admin"

    @computed_field
    @property
    def RABBITMQ_CONNECTION_URI(self) -> str:
        user = quote(self.RABBITMQ_USER, safe="")
        password = quote(self.RABBITMQ_PASSWORD, safe="")
        return f"amqp://{user}:{password}@{self.RABBITMQ_HOST}:{self.RABBITMQ_PORT}"

    WEB_BUILDER_JOB_QUEUE: str = "web_builder_job_queue"
    RABBITMQ_RETRY_DELAY_MS: int = 5000

    STARTER_REPO_URL: str = "https://github.com/Sibsankar-de/easeinv.git"
    STARTER_TEMPLATE_DIR: str = "store_web_builder_template_01"
    WORKSPACE_DIR: str = "workspace"
    GIT_USER: str = "webbuilder"


settings = Settings()

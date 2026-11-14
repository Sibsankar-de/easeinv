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


settings = Settings()

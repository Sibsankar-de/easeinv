from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env", env_file_encoding="utf-8", extra="ignore"
    )

    LOG_LEVEL: str = "INFO"

    SERVER_HOST: str = "127.0.0.1"
    SERVER_PORT: int = 5000


settings = Settings()

from typing import Protocol, runtime_checkable
from qdrant_client import AsyncQdrantClient

from src.settings import Settings, settings


@runtime_checkable
class QdrantClientProvider(Protocol):
    def create_client(self) -> AsyncQdrantClient: ...


class QdrantConfig:
    def __init__(
        self,
        host: str = "localhost",
        port: int = 6333,
        grpc_port: int = 6334,
        api_key: str | None = None,
        url: str | None = None,
    ) -> None:
        self.host: str = host
        self.port: int = port
        self.grpc_port: int = grpc_port
        self.api_key: str | None = api_key
        self.url: str | None = url

    @classmethod
    def from_settings(cls, app_settings: Settings = settings) -> "QdrantConfig":
        return cls(
            host=app_settings.QDRANT_HOST,
            port=app_settings.QDRANT_PORT,
            grpc_port=app_settings.QDRANT_GRPC_PORT,
            api_key=app_settings.QDRANT_API_KEY,
            url=app_settings.QDRANT_URL,
        )

    def create_client(self) -> AsyncQdrantClient:
        if self.url:
            return AsyncQdrantClient(url=self.url, api_key=self.api_key or None)
        return AsyncQdrantClient(
            host=self.host,
            port=self.port,
            grpc_port=self.grpc_port,
            api_key=self.api_key or None,
        )


def get_qdrant_config() -> QdrantConfig:
    return QdrantConfig.from_settings()


def get_qdrant_client() -> AsyncQdrantClient:
    return get_qdrant_config().create_client()

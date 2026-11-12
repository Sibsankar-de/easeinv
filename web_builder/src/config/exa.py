from typing import Protocol, runtime_checkable
from exa_py import AsyncExa

from src.settings import Settings, settings


@runtime_checkable
class ExaClientProvider(Protocol):
    def create_client(self) -> AsyncExa: ...


class ExaConfig:
    def __init__(self, api_key: str) -> None:
        self.api_key: str = api_key

    @classmethod
    def from_settings(cls, app_settings: Settings = settings) -> "ExaConfig":
        return cls(api_key=app_settings.EXA_API_KEY)

    def create_client(self) -> AsyncExa:
        return AsyncExa(api_key=self.api_key)


def get_exa_config() -> ExaConfig:
    return ExaConfig.from_settings()


def get_exa_client() -> AsyncExa:
    return get_exa_config().create_client()

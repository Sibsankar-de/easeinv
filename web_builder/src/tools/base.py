from abc import ABC, abstractmethod
from typing import Any

from src.tools.enums import ToolName


class BaseTool(ABC):
    name: ToolName
    description: str

    @abstractmethod
    async def __call__(self, *args: Any, **kwargs: Any) -> Any: ...

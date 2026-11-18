from abc import ABC, abstractmethod
from pathlib import Path
from pydantic import BaseModel


class CommandExecutionResult(BaseModel):
    exit_code: int
    stdout: str
    stderr: str


class CommandExecutionManager(ABC):
    @abstractmethod
    async def execute(
        self,
        command: str | list[str],
        cwd: Path | str | None = None,
    ) -> CommandExecutionResult: ...

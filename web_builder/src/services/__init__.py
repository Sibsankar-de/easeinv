from typing import Any

from src.services.command_execution import (
    CommandExecutionManager,
    CommandExecutionResult,
)

__all__ = [
    "CommandExecutionManager",
    "CommandExecutionResult",
    "JobManager",
]


def __getattr__(name: str) -> Any:
    if name == "JobManager":
        from src.services.job_manager import JobManager

        return JobManager
    raise AttributeError(f"module '{__name__}' has no attribute '{name}'")

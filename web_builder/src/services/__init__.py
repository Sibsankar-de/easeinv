from typing import Any

from src.services.command_execution import (
    CommandExecutionError,
    CommandExecutionManager,
    CommandExecutionResult,
    DockerCommandExecutionManager,
    get_command_execution_manager,
)

__all__ = [
    "CommandExecutionError",
    "CommandExecutionManager",
    "CommandExecutionResult",
    "DockerCommandExecutionManager",
    "JobManager",
    "get_command_execution_manager",
]


def __getattr__(name: str) -> Any:
    if name == "JobManager":
        from src.services.job_manager import JobManager

        return JobManager
    raise AttributeError(f"module '{__name__}' has no attribute '{name}'")

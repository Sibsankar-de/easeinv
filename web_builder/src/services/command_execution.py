import asyncio
from abc import ABC, abstractmethod
from pathlib import Path, PurePosixPath
import re
from pydantic import BaseModel

from src.settings import Settings, settings


class CommandExecutionResult(BaseModel):
    exit_code: int
    stdout: str
    stderr: str


class CommandExecutionError(Exception):
    pass


class CommandExecutionManager(ABC):
    @abstractmethod
    async def create_store_user(self, store_id: str) -> None: ...

    @abstractmethod
    async def execute(
        self,
        command: str | list[str],
        cwd: Path | str | None = None,
        store_id: str | None = None,
    ) -> CommandExecutionResult: ...


class DockerCommandExecutionManager(CommandExecutionManager):
    def __init__(
        self,
        container_name: str | None = None,
        container_workspace_path: str | None = None,
        host_workspace_dir: Path | str | None = None,
        app_settings: Settings = settings,
    ) -> None:
        self.settings: Settings = app_settings
        self.container_name: str = container_name or self.settings.DOCKER_CONTAINER_NAME
        self.container_workspace: PurePosixPath = PurePosixPath(
            container_workspace_path or self.settings.DOCKER_WORKSPACE_PATH
        )
        self.host_workspace_dir: Path = Path(
            host_workspace_dir or self.settings.WORKSPACE_DIR
        ).resolve()

    @staticmethod
    def normalize_store_id(store_id: str) -> str:
        cleaned = store_id.strip()
        return cleaned if cleaned.lower().startswith("store-") else f"store-{cleaned}"

    @classmethod
    def get_store_username(cls, store_id: str) -> str:
        folder_name = cls.normalize_store_id(store_id)
        sanitized = re.sub(r"[^a-z0-9_-]", "_", folder_name.lower())
        if not sanitized or not (sanitized[0].isalpha() or sanitized[0] == "_"):
            sanitized = f"u_{sanitized}"
        return sanitized[:32]

    def resolve_container_cwd(
        self,
        cwd: Path | str | None,
        store_id: str | None = None,
    ) -> PurePosixPath:
        if store_id is not None:
            store_folder = self.normalize_store_id(store_id)
            store_home = self.container_workspace / store_folder

            if cwd is None:
                return store_home

            if isinstance(cwd, Path):
                resolved_host = cwd.resolve()
                try:
                    rel = resolved_host.relative_to(self.host_workspace_dir)
                    candidate = self.container_workspace / PurePosixPath(rel.as_posix())
                except ValueError:
                    if str(cwd).startswith("/"):
                        candidate = PurePosixPath(str(cwd))
                    else:
                        candidate = store_home / PurePosixPath(str(cwd))
            else:
                cwd_str = str(cwd)
                if cwd_str.startswith("/"):
                    candidate = PurePosixPath(cwd_str)
                else:
                    candidate = store_home / PurePosixPath(cwd_str)

            parts: list[str] = []
            for part in candidate.parts:
                if part == "..":
                    if parts and parts[-1] != "/":
                        parts.pop()
                elif part != ".":
                    parts.append(part)
            normalized = PurePosixPath(*parts)

            try:
                normalized.relative_to(store_home)
            except ValueError as exc:
                raise CommandExecutionError(
                    f"Working directory '{cwd}' is outside store boundary '{store_home}'"
                ) from exc

            return normalized

        if cwd is None:
            return self.container_workspace

        if isinstance(cwd, Path):
            resolved_host = cwd.resolve()
            try:
                rel = resolved_host.relative_to(self.host_workspace_dir)
                return self.container_workspace / PurePosixPath(rel.as_posix())
            except ValueError:
                return PurePosixPath(str(cwd))

        cwd_str = str(cwd)
        if cwd_str.startswith("/"):
            return PurePosixPath(cwd_str)
        return self.container_workspace / PurePosixPath(cwd_str)

    async def create_store_user(self, store_id: str) -> None:
        store_folder = self.normalize_store_id(store_id)
        username = self.get_store_username(store_id)
        store_home = f"{self.container_workspace}/{store_folder}"

        cmd = [
            "docker",
            "exec",
            "-i",
            "-u",
            "0",
            self.container_name,
            "/scripts/create_store_user.sh",
            username,
            store_home,
        ]

        try:
            process = await asyncio.create_subprocess_exec(
                *cmd,
                stdout=asyncio.subprocess.PIPE,
                stderr=asyncio.subprocess.PIPE,
            )
            _, stderr_bytes = await process.communicate()
        except FileNotFoundError as error:
            raise CommandExecutionError("docker executable not found on host") from error

        if process.returncode != 0:
            err_msg = stderr_bytes.decode("utf-8", errors="replace")
            raise CommandExecutionError(
                f"Failed to create store user '{username}': {err_msg}"
            )

    async def execute(
        self,
        command: str | list[str],
        cwd: Path | str | None = None,
        store_id: str | None = None,
    ) -> CommandExecutionResult:
        if store_id is None and cwd is not None:
            match = re.search(r"store-[a-zA-Z0-9_-]+", str(cwd))
            if match:
                store_id = match.group(0)

        container_cwd = self.resolve_container_cwd(cwd, store_id)

        if store_id is not None:
            username = self.get_store_username(store_id)
            store_home = str(self.container_workspace / self.normalize_store_id(store_id))
            docker_cmd = [
                "docker",
                "exec",
                "-i",
                "-u",
                username,
                "-e",
                f"HOME={store_home}",
                "-w",
                str(container_cwd),
                self.container_name,
            ]
        else:
            docker_cmd = [
                "docker",
                "exec",
                "-i",
                "-w",
                str(container_cwd),
                self.container_name,
            ]

        if isinstance(command, str):
            docker_cmd.extend(["bash", "-c", command])
        else:
            docker_cmd.extend(command)

        try:
            process = await asyncio.create_subprocess_exec(
                *docker_cmd,
                stdout=asyncio.subprocess.PIPE,
                stderr=asyncio.subprocess.PIPE,
            )
            stdout_bytes, stderr_bytes = await process.communicate()
        except FileNotFoundError as error:
            raise CommandExecutionError("docker executable not found on host") from error

        return CommandExecutionResult(
            exit_code=process.returncode or 0,
            stdout=stdout_bytes.decode("utf-8", errors="replace"),
            stderr=stderr_bytes.decode("utf-8", errors="replace"),
        )


def get_command_execution_manager(
    app_settings: Settings = settings,
) -> CommandExecutionManager:
    return DockerCommandExecutionManager(app_settings=app_settings)

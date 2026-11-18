import tempfile
import unittest
from pathlib import Path
from unittest.mock import MagicMock

from src.schemas.job import Job, JobPayload, JobType
from src.services.command_execution import (
    CommandExecutionManager,
    CommandExecutionResult,
)
from src.settings import Settings
from src.workers.init_worker import StoreInitError, StoreInitWorker


class MockCommandExecutionManager(CommandExecutionManager):
    def __init__(self, exit_code: int = 0, stderr: str = "") -> None:
        self.exit_code: int = exit_code
        self.stderr: str = stderr
        self.executed_commands: list[tuple[str | list[str], Path | str | None]] = []

    async def execute(
        self,
        command: str | list[str],
        cwd: Path | str | None = None,
    ) -> CommandExecutionResult:
        self.executed_commands.append((command, cwd))

        if isinstance(command, list):
            if len(command) >= 3 and command[0] == "git" and command[1] == "clone":
                target_dir = Path(cwd) / command[-1] if cwd else Path(command[-1])
                target_dir.mkdir(parents=True, exist_ok=True)
            elif len(command) >= 4 and command[0] == "git" and command[1] == "sparse-checkout":
                template_name = command[3]
                target_template = Path(cwd) / template_name if cwd else Path(template_name)
                target_template.mkdir(parents=True, exist_ok=True)
                (target_template / "package.json").write_text('{"name": "template"}')
                stale_git = target_template / ".git"
                stale_git.mkdir(parents=True, exist_ok=True)
                (stale_git / "config").write_text("[core]")
                ignored_dir = target_template / "node_modules"
                ignored_dir.mkdir(parents=True, exist_ok=True)
                (ignored_dir / "dummy.txt").write_text("ignored")
            elif command == ["git", "clean", "-fdX"] and cwd:
                ignored_dir = Path(cwd) / "node_modules"
                if ignored_dir.exists():
                    import shutil

                    shutil.rmtree(ignored_dir)

        return CommandExecutionResult(
            exit_code=self.exit_code,
            stdout="success",
            stderr=self.stderr,
        )


class TestStoreInitWorker(unittest.IsolatedAsyncioTestCase):
    async def asyncSetUp(self) -> None:
        self.temp_dir = tempfile.TemporaryDirectory()
        self.workspace_dir = Path(self.temp_dir.name)
        self.settings = Settings(
            STARTER_REPO_URL="https://github.com/Sibsankar-de/easeinv.git",
            STARTER_TEMPLATE_DIR="store_web_builder_template_01",
            WORKSPACE_DIR=str(self.workspace_dir),
            S3_BUCKET_NAME="test-bucket",
        )
        self.command_executor = MockCommandExecutionManager()
        self.s3_client = MagicMock()
        self.worker = StoreInitWorker(
            command_executor=self.command_executor,
            s3_client=self.s3_client,
            app_settings=self.settings,
        )

    async def asyncTearDown(self) -> None:
        self.temp_dir.cleanup()

    async def test_missing_starter_repo_url_raises(self) -> None:
        bad_settings = Settings(
            STARTER_REPO_URL="",
            WORKSPACE_DIR=str(self.workspace_dir),
        )
        worker = StoreInitWorker(
            command_executor=self.command_executor,
            s3_client=self.s3_client,
            app_settings=bad_settings,
        )
        job = Job(
            job_id="job-1",
            store_id="store-100",
            type=JobType.WEB_BUILDER_STORE_INIT,
            payload=JobPayload(prompt="Create store"),
        )
        with self.assertRaises(StoreInitError) as ctx:
            await worker.execute(job)
        self.assertIn("STARTER_REPO_URL is not configured", str(ctx.exception))

    async def test_successful_sparse_clone_init_flow(self) -> None:
        job = Job(
            job_id="job-2",
            store_id="store-200",
            type=JobType.WEB_BUILDER_STORE_INIT,
            payload=JobPayload(prompt="Test Store"),
        )

        await self.worker.execute(job)

        self.assertEqual(len(self.command_executor.executed_commands), 6)

        clone_cmd = self.command_executor.executed_commands[0][0]
        self.assertEqual(clone_cmd[0], "git")
        self.assertEqual(clone_cmd[1], "clone")
        self.assertIn("--sparse", clone_cmd)
        self.assertEqual(clone_cmd[-2], "https://github.com/Sibsankar-de/easeinv.git")
        self.assertEqual(clone_cmd[-1], "easeinv")

        sparse_cmd = self.command_executor.executed_commands[1][0]
        self.assertEqual(sparse_cmd, ["git", "sparse-checkout", "set", "store_web_builder_template_01"])

        git_init_cmd = self.command_executor.executed_commands[2][0]
        self.assertEqual(git_init_cmd, ["git", "init"])

        git_add_cmd = self.command_executor.executed_commands[3][0]
        self.assertEqual(git_add_cmd, ["git", "add", "-A"])

        git_commit_cmd = self.command_executor.executed_commands[4][0]
        self.assertIn("commit", git_commit_cmd)
        self.assertIn("Project initialized", git_commit_cmd)
        self.assertIn("user.name=webbuilder", git_commit_cmd)
        self.assertIn("user.email=webbuilder", git_commit_cmd)

        clean_cmd = self.command_executor.executed_commands[5][0]
        self.assertEqual(clean_cmd, ["git", "clean", "-fdX"])

        store_dir = self.workspace_dir / "store-200"
        self.assertFalse((store_dir / "easeinv").exists())

        repo_dir = store_dir / "repository"
        self.assertTrue(repo_dir.exists())
        self.assertTrue((repo_dir / "package.json").exists())
        self.assertFalse((repo_dir / "node_modules").exists())

        zip_path = store_dir / "repository.zip"
        self.assertTrue(zip_path.exists())

        self.s3_client.upload_file.assert_called_once_with(
            Filename=str(zip_path),
            Bucket="test-bucket",
            Key="web_stores/store-200/draft/repository.zip",
        )

    async def test_custom_git_user_applied(self) -> None:
        custom_settings = Settings(
            STARTER_REPO_URL="https://github.com/Sibsankar-de/easeinv.git",
            STARTER_TEMPLATE_DIR="store_web_builder_template_01",
            WORKSPACE_DIR=str(self.workspace_dir),
            S3_BUCKET_NAME="test-bucket",
            GIT_USER="custom_author",
        )
        worker = StoreInitWorker(
            command_executor=self.command_executor,
            s3_client=self.s3_client,
            app_settings=custom_settings,
        )
        job = Job(
            job_id="job-custom-user",
            store_id="store-250",
            type=JobType.WEB_BUILDER_STORE_INIT,
            payload=JobPayload(prompt="Test custom user"),
        )
        await worker.execute(job)

        commit_cmd = self.command_executor.executed_commands[4][0]
        self.assertIn("user.name=custom_author", commit_cmd)
        self.assertIn("user.email=custom_author", commit_cmd)

    async def test_clone_failure_raises(self) -> None:
        failing_executor = MockCommandExecutionManager(
            exit_code=1, stderr="Repository not found"
        )
        worker = StoreInitWorker(
            command_executor=failing_executor,
            s3_client=self.s3_client,
            app_settings=self.settings,
        )
        job = Job(
            job_id="job-3",
            store_id="store-300",
            type=JobType.WEB_BUILDER_STORE_INIT,
            payload=JobPayload(prompt="Test Store"),
        )

        with self.assertRaises(StoreInitError) as ctx:
            await worker.execute(job)
        self.assertIn("git clone failed", str(ctx.exception))

    async def test_sparse_checkout_failure_raises(self) -> None:
        class SparseFailingExecutor(MockCommandExecutionManager):
            async def execute(
                self,
                command: str | list[str],
                cwd: Path | str | None = None,
            ) -> CommandExecutionResult:
                self.executed_commands.append((command, cwd))
                if isinstance(command, list) and "sparse-checkout" in command:
                    return CommandExecutionResult(exit_code=1, stdout="", stderr="sparse checkout failed")
                return await super().execute(command, cwd)

        worker = StoreInitWorker(
            command_executor=SparseFailingExecutor(),
            s3_client=self.s3_client,
            app_settings=self.settings,
        )
        job = Job(
            job_id="job-4",
            store_id="store-400",
            type=JobType.WEB_BUILDER_STORE_INIT,
            payload=JobPayload(prompt="Test Store"),
        )

        with self.assertRaises(StoreInitError) as ctx:
            await worker.execute(job)
        self.assertIn("git sparse-checkout failed", str(ctx.exception))

    async def test_clean_failure_raises(self) -> None:
        class CleanFailingExecutor(MockCommandExecutionManager):
            async def execute(
                self,
                command: str | list[str],
                cwd: Path | str | None = None,
            ) -> CommandExecutionResult:
                self.executed_commands.append((command, cwd))
                if isinstance(command, list) and command == ["git", "clean", "-fdX"]:
                    return CommandExecutionResult(exit_code=1, stdout="", stderr="git clean failed")
                return await super().execute(command, cwd)

        worker = StoreInitWorker(
            command_executor=CleanFailingExecutor(),
            s3_client=self.s3_client,
            app_settings=self.settings,
        )
        job = Job(
            job_id="job-5",
            store_id="store-500",
            type=JobType.WEB_BUILDER_STORE_INIT,
            payload=JobPayload(prompt="Test Store"),
        )

        with self.assertRaises(StoreInitError) as ctx:
            await worker.execute(job)
        self.assertIn("git clean failed", str(ctx.exception))


if __name__ == "__main__":
    unittest.main()

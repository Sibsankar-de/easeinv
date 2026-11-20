import asyncio
from pathlib import Path, PurePosixPath
import tempfile
import unittest
from unittest.mock import AsyncMock, patch

from src.services.command_execution import (
    CommandExecutionError,
    DockerCommandExecutionManager,
    get_command_execution_manager,
)
from src.settings import Settings


class TestDockerCommandExecutionManager(unittest.IsolatedAsyncioTestCase):
    def setUp(self) -> None:
        self.temp_dir = tempfile.TemporaryDirectory()
        self.host_workspace = Path(self.temp_dir.name)
        self.settings = Settings(
            WORKSPACE_DIR=str(self.host_workspace),
            DOCKER_CONTAINER_NAME="test_executor_container",
            DOCKER_WORKSPACE_PATH="/workspace",
        )
        self.manager = DockerCommandExecutionManager(app_settings=self.settings)

    def tearDown(self) -> None:
        self.temp_dir.cleanup()

    def test_normalize_store_id(self) -> None:
        self.assertEqual(
            DockerCommandExecutionManager.normalize_store_id("100"),
            "store-100",
        )
        self.assertEqual(
            DockerCommandExecutionManager.normalize_store_id("store-100"),
            "store-100",
        )
        self.assertEqual(
            DockerCommandExecutionManager.normalize_store_id("  store-xyz  "),
            "store-xyz",
        )

    def test_get_store_username(self) -> None:
        self.assertEqual(
            DockerCommandExecutionManager.get_store_username("100"),
            "store-100",
        )
        self.assertEqual(
            DockerCommandExecutionManager.get_store_username("store-100"),
            "store-100",
        )
        self.assertEqual(
            DockerCommandExecutionManager.get_store_username("Store-ABC-1"),
            "store-abc-1",
        )

    def test_resolve_container_cwd_default(self) -> None:
        resolved = self.manager.resolve_container_cwd(None, store_id="100")
        self.assertEqual(resolved, PurePosixPath("/workspace/store-100"))

    def test_resolve_container_cwd_relative(self) -> None:
        resolved = self.manager.resolve_container_cwd("repository", store_id="store-100")
        self.assertEqual(resolved, PurePosixPath("/workspace/store-100/repository"))

    def test_resolve_container_cwd_host_path(self) -> None:
        store_path = self.host_workspace / "store-100" / "easeinv"
        resolved = self.manager.resolve_container_cwd(store_path, store_id="store-100")
        self.assertEqual(resolved, PurePosixPath("/workspace/store-100/easeinv"))

    def test_resolve_container_cwd_outside_boundary_raises(self) -> None:
        with self.assertRaises(CommandExecutionError):
            self.manager.resolve_container_cwd("../store-200", store_id="store-100")

        with self.assertRaises(CommandExecutionError):
            self.manager.resolve_container_cwd("/workspace/store-200", store_id="store-100")

        with self.assertRaises(CommandExecutionError):
            self.manager.resolve_container_cwd("/etc", store_id="store-100")

    def test_resolve_container_cwd_without_store_id(self) -> None:
        resolved_none = self.manager.resolve_container_cwd(None)
        self.assertEqual(resolved_none, PurePosixPath("/workspace"))

        resolved_rel = self.manager.resolve_container_cwd("some/dir")
        self.assertEqual(resolved_rel, PurePosixPath("/workspace/some/dir"))

    @patch("asyncio.create_subprocess_exec")
    async def test_create_store_user_success(self, mock_subprocess: AsyncMock) -> None:
        mock_proc = AsyncMock()
        mock_proc.returncode = 0
        mock_proc.communicate.return_value = (b"", b"")
        mock_subprocess.return_value = mock_proc

        await self.manager.create_store_user("100")

        mock_subprocess.assert_called_once()
        call_args = mock_subprocess.call_args[0]
        self.assertEqual(call_args[0:6], ("docker", "exec", "-i", "-u", "0", "test_executor_container"))
        self.assertEqual(call_args[6], "/scripts/create_store_user.sh")
        self.assertEqual(call_args[7], "store-100")
        self.assertEqual(call_args[8], "/workspace/store-100")

    @patch("asyncio.create_subprocess_exec")
    async def test_create_store_user_failure_raises(self, mock_subprocess: AsyncMock) -> None:
        mock_proc = AsyncMock()
        mock_proc.returncode = 1
        mock_proc.communicate.return_value = (b"", b"useradd failed")
        mock_subprocess.return_value = mock_proc

        with self.assertRaises(CommandExecutionError) as ctx:
            await self.manager.create_store_user("100")
        self.assertIn("Failed to create store user", str(ctx.exception))

    @patch("asyncio.create_subprocess_exec")
    async def test_execute_with_store_id(self, mock_subprocess: AsyncMock) -> None:
        mock_proc = AsyncMock()
        mock_proc.returncode = 0
        mock_proc.communicate.return_value = (b"output", b"")
        mock_subprocess.return_value = mock_proc

        result = await self.manager.execute(
            ["git", "status"],
            cwd="repository",
            store_id="store-100",
        )

        self.assertEqual(result.exit_code, 0)
        self.assertEqual(result.stdout, "output")

        call_args = mock_subprocess.call_args[0]
        self.assertEqual(call_args[0:5], ("docker", "exec", "-i", "-u", "store-100"))
        self.assertEqual(call_args[5:7], ("-e", "HOME=/workspace/store-100"))
        self.assertEqual(call_args[7:9], ("-w", "/workspace/store-100/repository"))
        self.assertEqual(call_args[9], "test_executor_container")
        self.assertEqual(call_args[10:], ("git", "status"))

    @patch("asyncio.create_subprocess_exec")
    async def test_execute_string_command(self, mock_subprocess: AsyncMock) -> None:
        mock_proc = AsyncMock()
        mock_proc.returncode = 0
        mock_proc.communicate.return_value = (b"done", b"")
        mock_subprocess.return_value = mock_proc

        result = await self.manager.execute(
            "npm run build",
            store_id="store-100",
        )

        self.assertEqual(result.exit_code, 0)
        call_args = mock_subprocess.call_args[0]
        self.assertEqual(call_args[-3:], ("bash", "-c", "npm run build"))

    @patch("asyncio.create_subprocess_exec")
    async def test_execute_inferred_store_id_from_cwd(self, mock_subprocess: AsyncMock) -> None:
        mock_proc = AsyncMock()
        mock_proc.returncode = 0
        mock_proc.communicate.return_value = (b"inferred", b"")
        mock_subprocess.return_value = mock_proc

        cwd = self.host_workspace / "store-350" / "repository"
        result = await self.manager.execute(["git", "init"], cwd=cwd)

        self.assertEqual(result.exit_code, 0)
        call_args = mock_subprocess.call_args[0]
        self.assertIn("-u", call_args)
        user_idx = call_args.index("-u")
        self.assertEqual(call_args[user_idx + 1], "store-350")

    @patch("asyncio.create_subprocess_exec")
    async def test_execute_creates_file_inside_store(self, mock_subprocess: AsyncMock) -> None:
        mock_proc = AsyncMock()
        mock_proc.returncode = 0
        mock_proc.communicate.return_value = (b"", b"")
        mock_subprocess.return_value = mock_proc

        result = await self.manager.execute(
            "echo 'hello easeinv' > app.js",
            store_id="store-file-1",
        )

        self.assertEqual(result.exit_code, 0)
        call_args = mock_subprocess.call_args[0]
        self.assertEqual(call_args[0:5], ("docker", "exec", "-i", "-u", "store-file-1"))
        self.assertEqual(call_args[5:7], ("-e", "HOME=/workspace/store-file-1"))
        self.assertEqual(call_args[7:9], ("-w", "/workspace/store-file-1"))
        self.assertEqual(call_args[9], "test_executor_container")
        self.assertEqual(call_args[10:], ("bash", "-c", "echo 'hello easeinv' > app.js"))

    @patch("asyncio.create_subprocess_exec", side_effect=FileNotFoundError("No docker"))
    async def test_execute_docker_missing_raises(self, _: AsyncMock) -> None:
        with self.assertRaises(CommandExecutionError) as ctx:
            await self.manager.execute(["ls"])
        self.assertIn("docker executable not found", str(ctx.exception))

    def test_factory_function(self) -> None:
        executor = get_command_execution_manager(self.settings)
        self.assertIsInstance(executor, DockerCommandExecutionManager)


class TestDockerCommandExecutionIntegration(unittest.IsolatedAsyncioTestCase):
    async def asyncSetUp(self) -> None:
        self.manager = DockerCommandExecutionManager()
        # Verify container is reachable
        check_proc = await asyncio.create_subprocess_exec(
            "docker", "inspect", self.manager.container_name,
            stdout=asyncio.subprocess.PIPE,
            stderr=asyncio.subprocess.PIPE,
        )
        await check_proc.communicate()
        if check_proc.returncode != 0:
            self.skipTest(f"Container '{self.manager.container_name}' is not running")

    async def asyncTearDown(self) -> None:
        cleanup_cmd = (
            "userdel -r store-test-store-int-1 || true; "
            "userdel -r store-test-store-int-2 || true; "
            "userdel -r store-file-test || true; "
            "rm -rf /workspace/store-test-store-int-* /workspace/store-file-test"
        )
        cleanup_proc = await asyncio.create_subprocess_exec(
            "docker", "exec", "-i", "-u", "0", self.manager.container_name,
            "bash", "-c", cleanup_cmd,
            stdout=asyncio.subprocess.PIPE,
            stderr=asyncio.subprocess.PIPE,
        )
        await cleanup_proc.communicate()

    async def test_live_container_user_creation_and_isolated_execution(self) -> None:
        store_1 = "test-store-int-1"
        store_2 = "test-store-int-2"

        await self.manager.create_store_user(store_1)
        await self.manager.create_store_user(store_2)

        # Common commands (git, npm, node) work as store user
        git_res = await self.manager.execute(["git", "--version"], store_id=store_1)
        self.assertEqual(git_res.exit_code, 0)
        self.assertIn("git version", git_res.stdout)

        node_res = await self.manager.execute(["node", "--version"], store_id=store_1)
        self.assertEqual(node_res.exit_code, 0)
        self.assertIn("v20.", node_res.stdout)

        npm_res = await self.manager.execute(["npm", "--version"], store_id=store_1)
        self.assertEqual(npm_res.exit_code, 0)

        # Store 1 creates a private file in its workspace
        touch_res = await self.manager.execute("touch secret.txt && chmod 600 secret.txt", store_id=store_1)
        self.assertEqual(touch_res.exit_code, 0)

        # Store 2 attempts to read store 1's workspace directly inside container
        blocked_res = await self.manager.execute("ls /workspace/store-test-store-int-1", store_id=store_2)
        self.assertNotEqual(blocked_res.exit_code, 0)
        self.assertIn("Permission denied", blocked_res.stderr)

        # Path traversal from Store 1 manager boundary check
        with self.assertRaises(CommandExecutionError):
            await self.manager.execute(["ls"], cwd="/workspace/store-test-store-int-2", store_id=store_1)

    async def test_create_file_inside_store_workspace(self) -> None:
        store_id = "store-file-test"
        await self.manager.create_store_user(store_id)

        # Create a file inside /workspace/store-file-test using store user
        create_res = await self.manager.execute(
            "echo 'console.log(\"Hello from store\");' > app.js",
            store_id=store_id,
        )
        self.assertEqual(create_res.exit_code, 0)

        # Verify file content inside container
        read_res = await self.manager.execute(["cat", "app.js"], store_id=store_id)
        self.assertEqual(read_res.exit_code, 0)
        self.assertIn('console.log("Hello from store");', read_res.stdout)

        # Verify file owner inside container is the store user
        stat_res = await self.manager.execute(["stat", "-c", "%U:%G", "app.js"], store_id=store_id)
        self.assertEqual(stat_res.exit_code, 0)
        self.assertIn("store-file-test", stat_res.stdout)

        # Verify bidirectional bind mount reflection on the host filesystem
        host_file = Path(self.manager.settings.WORKSPACE_DIR) / "store-file-test" / "app.js"
        self.assertTrue(host_file.exists())
        self.assertEqual(host_file.read_text(encoding="utf-8").strip(), 'console.log("Hello from store");')


if __name__ == "__main__":
    unittest.main()

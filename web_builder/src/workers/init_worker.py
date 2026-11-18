import shutil
from pathlib import Path
from botocore.client import BaseClient
from botocore.exceptions import BotoCoreError, ClientError

from src.schemas.job import Job
from src.services.command_execution import CommandExecutionManager
from src.settings import Settings, settings
from src.tools.create_zip import CreateZipTool
from src.utils.logger import get_logger
from src.workers.base import BaseJobWorker

logger = get_logger(__name__)


class StoreInitError(Exception):
    pass


class StoreInitWorker(BaseJobWorker):
    def __init__(
        self,
        command_executor: CommandExecutionManager,
        s3_client: BaseClient,
        zip_tool: CreateZipTool | None = None,
        app_settings: Settings = settings,
    ) -> None:
        self.command_executor: CommandExecutionManager = command_executor
        self.s3_client: BaseClient = s3_client
        self.zip_tool: CreateZipTool = zip_tool if zip_tool is not None else CreateZipTool()
        self.settings: Settings = app_settings

    async def execute(self, job: Job) -> None:
        if not self.settings.STARTER_REPO_URL:
            raise StoreInitError("STARTER_REPO_URL is not configured")

        workspace_root = Path(self.settings.WORKSPACE_DIR).resolve()
        store_folder_name = (
            job.store_id
            if job.store_id.startswith("store-")
            else f"store-{job.store_id}"
        )
        store_workspace = workspace_root / store_folder_name
        store_workspace.mkdir(parents=True, exist_ok=True)

        clone_dir = store_workspace / "easeinv"
        if clone_dir.exists():
            shutil.rmtree(clone_dir)

        repo_dir = store_workspace / "repository"
        if repo_dir.exists():
            shutil.rmtree(repo_dir)

        clone_res = await self.command_executor.execute(
            [
                "git",
                "clone",
                "--depth",
                "1",
                "--filter=blob:none",
                "--sparse",
                self.settings.STARTER_REPO_URL,
                "easeinv",
            ],
            cwd=store_workspace,
        )
        if clone_res.exit_code != 0:
            raise StoreInitError(f"git clone failed: {clone_res.stderr}")

        template_dir_name = self.settings.STARTER_TEMPLATE_DIR
        sparse_res = await self.command_executor.execute(
            ["git", "sparse-checkout", "set", template_dir_name],
            cwd=clone_dir,
        )
        if sparse_res.exit_code != 0:
            raise StoreInitError(f"git sparse-checkout failed: {sparse_res.stderr}")

        template_source = clone_dir / template_dir_name
        if not template_source.exists():
            raise StoreInitError(
                f"Template directory '{template_dir_name}' not found after sparse-checkout"
            )

        shutil.move(str(template_source), str(repo_dir))

        if clone_dir.exists():
            shutil.rmtree(clone_dir)

        git_dir = repo_dir / ".git"
        if git_dir.exists():
            if git_dir.is_dir():
                shutil.rmtree(git_dir)
            else:
                git_dir.unlink()

        git_init_res = await self.command_executor.execute(
            ["git", "init"],
            cwd=repo_dir,
        )
        if git_init_res.exit_code != 0:
            raise StoreInitError(f"git init failed: {git_init_res.stderr}")

        git_add_res = await self.command_executor.execute(
            ["git", "add", "-A"],
            cwd=repo_dir,
        )
        if git_add_res.exit_code != 0:
            raise StoreInitError(f"git add failed: {git_add_res.stderr}")

        git_user = self.settings.GIT_USER
        git_commit_res = await self.command_executor.execute(
            [
                "git",
                "-c",
                f"user.name={git_user}",
                "-c",
                f"user.email={git_user}",
                "commit",
                "-m",
                "Project initialized",
            ],
            cwd=repo_dir,
        )
        if git_commit_res.exit_code != 0:
            raise StoreInitError(f"git commit failed: {git_commit_res.stderr}")

        git_clean_res = await self.command_executor.execute(
            ["git", "clean", "-fdX"],
            cwd=repo_dir,
        )
        if git_clean_res.exit_code != 0:
            raise StoreInitError(f"git clean failed: {git_clean_res.stderr}")

        zip_path = store_workspace / "repository.zip"
        if zip_path.exists():
            zip_path.unlink()

        await self.zip_tool(source_dir=repo_dir, output_zip=zip_path)

        s3_key = f"web_stores/{store_folder_name}/draft/repository.zip"
        try:
            self.s3_client.upload_file(
                Filename=str(zip_path),
                Bucket=self.settings.S3_BUCKET_NAME,
                Key=s3_key,
            )
        except (BotoCoreError, ClientError) as error:
            raise StoreInitError(
                f"S3 upload failed for key {s3_key}: {error}"
            ) from error

        logger.info(
            f"Store initialization completed for store {job.store_id} at {s3_key}"
        )

from collections.abc import AsyncGenerator
from contextlib import asynccontextmanager
from fastapi import FastAPI

from src.mcp.client import mcp_client_manager
from src.services.command_execution import get_command_execution_manager
from src.services.job_manager import JobManager
from src.utils.logger import get_logger

logger = get_logger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncGenerator[None, None]:
    command_executor = get_command_execution_manager()
    job_manager = JobManager(command_executor=command_executor)
    app.state.job_manager = job_manager
    try:
        await job_manager.start()
    except Exception as error:
        logger.warning(f"Could not connect JobManager to RabbitMQ at startup: {error}")

    async with mcp_client_manager.connect() as client:
        app.state.mcp_client = client
        try:
            yield
        finally:
            await job_manager.stop()


app = FastAPI(title="easeinv_web_builder", lifespan=lifespan)

from collections.abc import AsyncGenerator
from contextlib import asynccontextmanager
from fastapi import FastAPI

from src.mcp.client import mcp_client_manager
from src.services.job_manager import JobManager
from src.utils.logger import get_logger

logger = get_logger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncGenerator[None, None]:
    job_manager = JobManager()
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

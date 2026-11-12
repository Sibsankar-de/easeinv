from collections.abc import AsyncGenerator
from contextlib import asynccontextmanager
from fastapi import FastAPI

from src.mcp.client import mcp_client_manager


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncGenerator[None, None]:
    async with mcp_client_manager.connect() as client:
        app.state.mcp_client = client
        yield


app = FastAPI(title="easeinv_web_builder", lifespan=lifespan)

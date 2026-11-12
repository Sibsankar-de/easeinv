from collections.abc import AsyncGenerator
from contextlib import asynccontextmanager
from typing import Protocol, runtime_checkable
from fastmcp import Client, FastMCP

from src.mcp.server import get_mcp_server
from src.tools.enums import ToolName


@runtime_checkable
class MCPClientProvider(Protocol):
    def get_client(self) -> Client: ...
    async def list_tool_names(self) -> list[ToolName]: ...


class MCPClientManager:
    def __init__(self, server: FastMCP | None = None) -> None:
        self._server: FastMCP = server if server is not None else get_mcp_server()
        self._client: Client = Client(self._server)

    def get_client(self) -> Client:
        return self._client

    async def list_tool_names(self) -> list[ToolName]:
        tools = await self._client.list_tools()
        return [ToolName(tool.name) for tool in tools]

    @asynccontextmanager
    async def connect(self) -> AsyncGenerator[Client, None]:
        async with self._client:
            yield self._client


mcp_client_manager = MCPClientManager()


def get_mcp_client() -> Client:
    return mcp_client_manager.get_client()

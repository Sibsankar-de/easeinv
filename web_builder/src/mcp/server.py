from typing import Protocol, runtime_checkable
from fastmcp import FastMCP

from src.settings import Settings, settings
from src.mcp.registry import register_tools


@runtime_checkable
class MCPServerProvider(Protocol):
    def get_server(self) -> FastMCP: ...


class MCPServer:
    def __init__(self, name: str) -> None:
        self.name: str = name
        self._server: FastMCP = FastMCP(name=self.name)
        register_tools(self._server)

    @classmethod
    def from_settings(cls, app_settings: Settings = settings) -> "MCPServer":
        return cls(name=app_settings.MCP_SERVER_NAME)

    def get_server(self) -> FastMCP:
        return self._server


mcp_server = MCPServer.from_settings()


def get_mcp_server() -> FastMCP:
    return mcp_server.get_server()

from collections.abc import Mapping
from fastmcp import FastMCP

from src.tools.base import BaseTool
from src.tools.enums import ToolName
from src.tools.web_fetch import WebFetchTool
from src.tools.web_search import WebSearchTool

TOOLS_MAP: dict[ToolName, BaseTool] = {
    ToolName.WEB_SEARCH: WebSearchTool(),
    ToolName.WEB_FETCH: WebFetchTool(),
}


def get_tools_map() -> dict[ToolName, BaseTool]:
    return TOOLS_MAP


def get_tool(tool_name: ToolName) -> BaseTool:
    return TOOLS_MAP[tool_name]


def register_tools(
    server: FastMCP, tools: Mapping[ToolName, BaseTool] | None = None
) -> None:
    tool_map = tools if tools is not None else TOOLS_MAP
    for tool_name, tool in tool_map.items():
        server.tool(name=tool_name.value, description=tool.description)(tool.__call__)

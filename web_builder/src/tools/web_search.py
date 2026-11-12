import dataclasses
from typing import Any
from exa_py import AsyncExa

from src.config.exa import get_exa_client
from src.tools.base import BaseTool
from src.tools.enums import ToolName


class WebSearchTool(BaseTool):
    name: ToolName = ToolName.WEB_SEARCH
    description: str = "Search the web using Exa search engine."

    def __init__(self, client: AsyncExa | None = None) -> None:
        self.client: AsyncExa = client if client is not None else get_exa_client()

    async def __call__(self, query: str, num_results: int = 5) -> dict[str, Any]:
        response = await self.client.search(query=query, num_results=num_results)
        return {
            "results": [
                {k: v for k, v in dataclasses.asdict(r).items() if v is not None}
                for r in response.results
            ]
        }

import dataclasses
from typing import Any
from exa_py import AsyncExa

from src.config.exa import get_exa_client
from src.tools.base import BaseTool
from src.tools.enums import ToolName


class WebFetchTool(BaseTool):
    name: ToolName = ToolName.WEB_FETCH
    description: str = "Fetch webpage contents for specified URLs using Exa."

    def __init__(self, client: AsyncExa | None = None) -> None:
        self.client: AsyncExa = client if client is not None else get_exa_client()

    async def __call__(self, urls: list[str] | str) -> dict[str, Any]:
        target_urls: list[str] = [urls] if isinstance(urls, str) else urls
        response = await self.client.get_contents(urls=target_urls)
        return {
            "results": [
                {k: v for k, v in dataclasses.asdict(r).items() if v is not None}
                for r in response.results
            ]
        }

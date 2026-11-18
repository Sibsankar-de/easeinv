import asyncio
from pathlib import Path
import zipfile

from src.tools.base import BaseTool
from src.tools.enums import ToolName


class CreateZipTool(BaseTool):
    name: ToolName = ToolName.CREATE_ZIP
    description: str = "Compress a directory into a zip archive."

    async def __call__(
        self, source_dir: str | Path, output_zip: str | Path
    ) -> str:
        source_path = Path(source_dir).resolve()
        if not source_path.is_dir():
            raise FileNotFoundError(f"Source directory does not exist: {source_path}")

        output_path = Path(output_zip).resolve()
        output_path.parent.mkdir(parents=True, exist_ok=True)

        def _zip() -> None:
            with zipfile.ZipFile(output_path, "w", zipfile.ZIP_DEFLATED) as archive:
                for item in source_path.rglob("*"):
                    arcname = item.relative_to(source_path)
                    archive.write(item, arcname)

        await asyncio.to_thread(_zip)
        return str(output_path)

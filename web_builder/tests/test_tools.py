import tempfile
import unittest
import zipfile
from pathlib import Path

from src.tools.create_zip import CreateZipTool
from src.tools.enums import ToolName


class TestCreateZipTool(unittest.IsolatedAsyncioTestCase):
    async def asyncSetUp(self) -> None:
        self.temp_dir = tempfile.TemporaryDirectory()
        self.base_path = Path(self.temp_dir.name)
        self.tool = CreateZipTool()

    async def asyncTearDown(self) -> None:
        self.temp_dir.cleanup()

    def test_tool_metadata(self) -> None:
        self.assertEqual(self.tool.name, ToolName.CREATE_ZIP)
        self.assertEqual(self.tool.name.value, "create_zip")
        self.assertTrue(len(self.tool.description) > 0)

    async def test_create_zip_success(self) -> None:
        source_dir = self.base_path / "source"
        source_dir.mkdir()
        (source_dir / "index.js").write_text("console.log('hello');")

        sub_dir = source_dir / "sub"
        sub_dir.mkdir()
        (sub_dir / "styles.css").write_text("body { margin: 0; }")

        output_zip = self.base_path / "output" / "archive.zip"

        result_path = await self.tool(source_dir=source_dir, output_zip=output_zip)

        self.assertEqual(result_path, str(output_zip.resolve()))
        self.assertTrue(output_zip.exists())

        with zipfile.ZipFile(output_zip, "r") as archive:
            names = archive.namelist()
            self.assertIn("index.js", names)
            self.assertIn("sub/styles.css", names)
            self.assertEqual(archive.read("index.js").decode("utf-8"), "console.log('hello');")

    async def test_create_zip_nonexistent_source_raises(self) -> None:
        nonexistent = self.base_path / "does_not_exist"
        output_zip = self.base_path / "archive.zip"

        with self.assertRaises(FileNotFoundError) as ctx:
            await self.tool(source_dir=nonexistent, output_zip=output_zip)
        self.assertIn("Source directory does not exist", str(ctx.exception))


if __name__ == "__main__":
    unittest.main()

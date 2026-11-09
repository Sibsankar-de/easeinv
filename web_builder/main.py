import sys
from pathlib import Path

from src.settings import settings
from src.utils.logger import configure_logging

sys.path.insert(0, str(Path(__file__).parent / "src"))


def start_server() -> None:
    import uvicorn

    uvicorn.run("src.app:app", host=settings.SERVER_HOST, port=settings.SERVER_PORT)


def main():
    configure_logging()

    start_server()


if __name__ == "__main__":
    main()

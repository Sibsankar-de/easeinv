import logging

from rich.logging import RichHandler

from src.settings import settings


def configure_logging() -> None:
    rich_level = getattr(logging, settings.LOG_LEVEL.upper(), logging.INFO)

    logging.basicConfig(
        level=rich_level,
        format="%(name)s: %(message)s",
        handlers=[RichHandler(rich_tracebacks=True, level=rich_level)],
    )


def get_logger(name: str) -> logging.Logger:
    return logging.getLogger(name)

from abc import ABC, abstractmethod

from src.schemas.job import Job


class BaseJobWorker(ABC):
    @abstractmethod
    async def execute(self, job: Job) -> None: ...

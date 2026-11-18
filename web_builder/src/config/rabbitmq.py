from typing import Protocol, runtime_checkable
import aio_pika
from aio_pika.abc import AbstractQueue, AbstractRobustChannel, AbstractRobustConnection

from src.settings import Settings, settings


@runtime_checkable
class RabbitMQConnectionProvider(Protocol):
    async def connect(self) -> AbstractRobustConnection: ...
    async def get_channel(
        self, connection: AbstractRobustConnection
    ) -> AbstractRobustChannel: ...
    async def declare_queues(
        self, channel: AbstractRobustChannel
    ) -> tuple[AbstractQueue, AbstractQueue, AbstractQueue]: ...


class RabbitMQConfig:
    def __init__(
        self,
        connection_uri: str,
        job_queue_name: str,
        retry_delay_ms: int,
    ) -> None:
        self.connection_uri: str = connection_uri
        self.job_queue_name: str = job_queue_name
        self.retry_delay_ms: int = retry_delay_ms

    @classmethod
    def from_settings(cls, app_settings: Settings = settings) -> "RabbitMQConfig":
        return cls(
            connection_uri=app_settings.RABBITMQ_CONNECTION_URI,
            job_queue_name=app_settings.WEB_BUILDER_JOB_QUEUE,
            retry_delay_ms=app_settings.RABBITMQ_RETRY_DELAY_MS,
        )

    @property
    def retry_queue_name(self) -> str:
        return f"{self.job_queue_name}_retry"

    @property
    def dlq_name(self) -> str:
        return f"{self.job_queue_name}_dlq"

    async def connect(self) -> AbstractRobustConnection:
        return await aio_pika.connect_robust(self.connection_uri)

    async def get_channel(
        self, connection: AbstractRobustConnection
    ) -> AbstractRobustChannel:
        return await connection.channel()

    async def declare_queues(
        self, channel: AbstractRobustChannel
    ) -> tuple[AbstractQueue, AbstractQueue, AbstractQueue]:
        dlq = await channel.declare_queue(
            self.dlq_name,
            durable=True,
        )

        retry_queue = await channel.declare_queue(
            self.retry_queue_name,
            durable=True,
            arguments={
                "x-dead-letter-exchange": "",
                "x-dead-letter-routing-key": self.job_queue_name,
                "x-message-ttl": self.retry_delay_ms,
            },
        )

        main_queue = await channel.declare_queue(
            self.job_queue_name,
            durable=True,
            arguments={
                "x-dead-letter-exchange": "",
                "x-dead-letter-routing-key": self.retry_queue_name,
            },
        )

        return main_queue, retry_queue, dlq


def get_rabbitmq_config() -> RabbitMQConfig:
    return RabbitMQConfig.from_settings()

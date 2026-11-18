import asyncio
from collections.abc import Callable
from datetime import datetime, timezone
import json
from typing import Any
import aio_pika
from aio_pika.abc import (
    AbstractIncomingMessage,
    AbstractQueue,
    AbstractRobustChannel,
    AbstractRobustConnection,
)
from botocore.client import BaseClient
from pydantic import ValidationError

from src.config.rabbitmq import RabbitMQConfig, get_rabbitmq_config
from src.config.s3 import get_s3_client
from src.schemas.job import Job, JobType
from src.services.command_execution import CommandExecutionManager
from src.settings import Settings, settings
from src.utils.logger import get_logger
from src.workers.base import BaseJobWorker
from src.workers.init_worker import StoreInitWorker

logger = get_logger(__name__)

WORKER_MAP: dict[JobType, type[BaseJobWorker]] = {
    JobType.WEB_BUILDER_STORE_INIT: StoreInitWorker,
}


class JobManager:
    WORKER_MAP: dict[JobType, type[BaseJobWorker]] = WORKER_MAP

    def __init__(
        self,
        rabbitmq_config: RabbitMQConfig | None = None,
        command_executor: CommandExecutionManager | None = None,
        s3_client: BaseClient | None = None,
        worker_factory: Callable[[JobType], BaseJobWorker] | None = None,
        worker_map: dict[JobType, type[BaseJobWorker]] | None = None,
        app_settings: Settings = settings,
    ) -> None:
        self.rabbitmq_config: RabbitMQConfig = (
            rabbitmq_config if rabbitmq_config is not None else get_rabbitmq_config()
        )
        self.command_executor: CommandExecutionManager | None = command_executor
        self.s3_client: BaseClient | None = s3_client
        self.worker_factory: Callable[[JobType], BaseJobWorker] | None = worker_factory
        self.worker_map: dict[JobType, type[BaseJobWorker]] = (
            worker_map if worker_map is not None else self.WORKER_MAP.copy()
        )
        self.settings: Settings = app_settings

        self.connection: AbstractRobustConnection | None = None
        self.channel: AbstractRobustChannel | None = None
        self.main_queue: AbstractQueue | None = None
        self.consumer_tag: str | None = None
        self._active_tasks: set[asyncio.Task[None]] = set()
        self._is_running: bool = False

    async def start(self) -> None:
        self.connection = await self.rabbitmq_config.connect()
        self.channel = await self.rabbitmq_config.get_channel(self.connection)
        await self.channel.set_qos(prefetch_count=10)

        main_queue, _, _ = await self.rabbitmq_config.declare_queues(self.channel)
        self.main_queue = main_queue
        self.consumer_tag = await main_queue.consume(self._on_message)
        self._is_running = True
        logger.info(
            f"JobManager started listening on queue {self.rabbitmq_config.job_queue_name}"
        )

    async def stop(self) -> None:
        self._is_running = False

        if self.consumer_tag and self.main_queue:
            try:
                await self.main_queue.cancel(self.consumer_tag)
            except Exception as error:
                logger.warning(
                    f"Error cancelling consumer tag {self.consumer_tag}: {error}"
                )

        if self._active_tasks:
            for task in list(self._active_tasks):
                task.cancel()
            await asyncio.gather(*self._active_tasks, return_exceptions=True)
            self._active_tasks.clear()

        if self.channel and not self.channel.is_closed:
            await self.channel.close()
        if self.connection and not self.connection.is_closed:
            await self.connection.close()

        logger.info("JobManager stopped")

    async def _on_message(self, message: AbstractIncomingMessage) -> None:
        task: asyncio.Task[None] = asyncio.create_task(self._process_message(message))
        self._active_tasks.add(task)
        task.add_done_callback(self._active_tasks.discard)

    async def _process_message(self, message: AbstractIncomingMessage) -> None:
        try:
            raw_body = message.body.decode("utf-8")
            data = json.loads(raw_body)
        except (UnicodeDecodeError, json.JSONDecodeError) as decode_err:
            logger.error(f"Failed to decode message: {decode_err}")
            await self._publish_to_queue(
                queue_name=self.rabbitmq_config.dlq_name,
                payload=message.body,
                headers={"x-error-reason": f"Malformed payload: {decode_err}"},
            )
            await message.ack()
            return

        try:
            job = Job.model_validate(data)
        except ValidationError as val_err:
            logger.error(f"Invalid job schema: {val_err}")
            await self._publish_to_queue(
                queue_name=self.rabbitmq_config.dlq_name,
                payload=raw_body,
                headers={"x-error-reason": f"Validation error: {val_err}"},
            )
            await message.ack()
            return

        if job.expiry is not None:
            now_utc = datetime.now(timezone.utc)
            expiry_utc = (
                job.expiry
                if job.expiry.tzinfo
                else job.expiry.replace(tzinfo=timezone.utc)
            )
            if expiry_utc < now_utc:
                logger.warning(f"Job {job.job_id} has expired at {job.expiry}")
                await self._publish_to_queue(
                    queue_name=self.rabbitmq_config.dlq_name,
                    payload=job.model_dump_json(),
                    headers={"x-error-reason": "Job expired"},
                )
                await message.ack()
                return

        try:
            worker = self._get_worker(job.type)
            await worker.execute(job)
            await message.ack()
            logger.info(f"Successfully processed job {job.job_id} ({job.type})")
        except Exception as error:
            logger.error(f"Execution failed for job {job.job_id}: {error}")
            await self._handle_failure(job, message, str(error))

    def _get_worker(self, job_type: JobType) -> BaseJobWorker:
        if self.worker_factory is not None:
            return self.worker_factory(job_type)

        worker_class = self.worker_map.get(job_type)
        if worker_class is None:
            if job_type == JobType.WEB_BUILDER_STORE_DEVELOP:
                raise NotImplementedError("WEB_BUILDER_STORE_DEVELOP worker is not implemented yet")
            raise ValueError(f"Unsupported job type: {job_type}")

        return self._instantiate_worker(worker_class)

    def _instantiate_worker(self, worker_class: type[BaseJobWorker]) -> BaseJobWorker:
        if issubclass(worker_class, StoreInitWorker):
            if self.command_executor is None:
                raise RuntimeError(
                    "CommandExecutionManager is not configured for StoreInitWorker"
                )
            client = self.s3_client if self.s3_client is not None else get_s3_client()
            return worker_class(
                command_executor=self.command_executor,
                s3_client=client,
                app_settings=self.settings,
            )

        try:
            return worker_class()
        except TypeError as error:
            raise ValueError(
                f"Unable to instantiate worker class {worker_class}: {error}"
            ) from error

    async def _handle_failure(
        self, job: Job, message: AbstractIncomingMessage, error_message: str
    ) -> None:
        if job.retry_count + 1 <= job.max_retries:
            job.retry_count += 1
            logger.info(
                f"Retrying job {job.job_id} (attempt {job.retry_count}/{job.max_retries})"
            )
            await self._publish_to_queue(
                queue_name=self.rabbitmq_config.retry_queue_name,
                payload=job.model_dump_json(),
                headers={"x-error-reason": error_message},
            )
        else:
            logger.error(
                f"Job {job.job_id} exceeded max retries ({job.max_retries}). Routing to DLQ."
            )
            await self._publish_to_queue(
                queue_name=self.rabbitmq_config.dlq_name,
                payload=job.model_dump_json(),
                headers={"x-error-reason": f"Max retries exceeded: {error_message}"},
            )

        await message.ack()

    async def _publish_to_queue(
        self,
        queue_name: str,
        payload: str | bytes,
        headers: dict[str, Any] | None = None,
    ) -> None:
        if self.channel is None or self.channel.is_closed:
            raise RuntimeError("RabbitMQ channel is not available for publishing")

        body = payload.encode("utf-8") if isinstance(payload, str) else payload
        msg = aio_pika.Message(
            body=body,
            delivery_mode=aio_pika.DeliveryMode.PERSISTENT,
            content_type="application/json",
            headers=headers,
        )
        await self.channel.default_exchange.publish(msg, routing_key=queue_name)

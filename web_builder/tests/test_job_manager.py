from datetime import datetime, timedelta, timezone
import json
import unittest
from unittest.mock import AsyncMock, MagicMock

from src.config.rabbitmq import RabbitMQConfig
from src.schemas.job import Job, JobPayload, JobType
from src.services.job_manager import JobManager, WORKER_MAP
from src.workers.base import BaseJobWorker
from src.workers.init_worker import StoreInitWorker


class DummyWorker(BaseJobWorker):
    def __init__(self, should_fail: bool = False) -> None:
        self.should_fail: bool = should_fail
        self.executed_jobs: list[Job] = []

    async def execute(self, job: Job) -> None:
        if self.should_fail:
            raise RuntimeError("Dummy worker deliberate failure")
        self.executed_jobs.append(job)


class ParameterizedWorker(BaseJobWorker):
    def __init__(self, required_arg: str) -> None:
        self.required_arg = required_arg

    async def execute(self, job: Job) -> None:
        pass


class TestJobManager(unittest.IsolatedAsyncioTestCase):
    async def asyncSetUp(self) -> None:
        self.rabbitmq_config = RabbitMQConfig(
            connection_uri="amqp://localhost",
            job_queue_name="test_job_queue",
            retry_delay_ms=2000,
        )
        self.worker = DummyWorker()
        self.job_manager = JobManager(
            rabbitmq_config=self.rabbitmq_config,
            worker_factory=lambda _: self.worker,
        )

        mock_channel = MagicMock()
        mock_exchange = MagicMock()
        mock_exchange.publish = AsyncMock()
        mock_channel.default_exchange = mock_exchange
        mock_channel.is_closed = False
        self.job_manager.channel = mock_channel
        self.mock_exchange = mock_exchange

    async def test_process_valid_job_success(self) -> None:
        job = Job(
            job_id="job-10",
            store_id="store-10",
            type=JobType.WEB_BUILDER_STORE_INIT,
            payload=JobPayload(prompt="Build modern store"),
        )
        message = MagicMock()
        message.body = job.model_dump_json().encode("utf-8")
        message.ack = AsyncMock()

        await self.job_manager._process_message(message)

        self.assertEqual(len(self.worker.executed_jobs), 1)
        self.assertEqual(self.worker.executed_jobs[0].job_id, "job-10")
        message.ack.assert_called_once()
        self.mock_exchange.publish.assert_not_called()

    async def test_process_malformed_json_routes_to_dlq(self) -> None:
        message = MagicMock()
        message.body = b"not-valid-json"
        message.ack = AsyncMock()

        await self.job_manager._process_message(message)

        message.ack.assert_called_once()
        self.mock_exchange.publish.assert_called_once()
        call_args = self.mock_exchange.publish.call_args
        self.assertEqual(call_args.kwargs["routing_key"], "test_job_queue_dlq")

    async def test_process_validation_error_routes_to_dlq(self) -> None:
        message = MagicMock()
        message.body = json.dumps({"job_id": "missing_fields"}).encode("utf-8")
        message.ack = AsyncMock()

        await self.job_manager._process_message(message)

        message.ack.assert_called_once()
        self.mock_exchange.publish.assert_called_once()
        call_args = self.mock_exchange.publish.call_args
        self.assertEqual(call_args.kwargs["routing_key"], "test_job_queue_dlq")

    async def test_process_expired_job_routes_to_dlq(self) -> None:
        expired_time = datetime.now(timezone.utc) - timedelta(hours=1)
        job = Job(
            job_id="job-expired",
            store_id="store-expired",
            type=JobType.WEB_BUILDER_STORE_INIT,
            expiry=expired_time,
            payload=JobPayload(prompt="Expired store"),
        )
        message = MagicMock()
        message.body = job.model_dump_json().encode("utf-8")
        message.ack = AsyncMock()

        await self.job_manager._process_message(message)

        message.ack.assert_called_once()
        self.assertEqual(len(self.worker.executed_jobs), 0)
        self.mock_exchange.publish.assert_called_once()
        call_args = self.mock_exchange.publish.call_args
        self.assertEqual(call_args.kwargs["routing_key"], "test_job_queue_dlq")

    async def test_worker_failure_routes_to_retry_queue(self) -> None:
        failing_worker = DummyWorker(should_fail=True)
        self.job_manager.worker_factory = lambda _: failing_worker

        job = Job(
            job_id="job-retry",
            store_id="store-retry",
            type=JobType.WEB_BUILDER_STORE_INIT,
            retry_count=0,
            max_retries=3,
            payload=JobPayload(prompt="Retry store"),
        )
        message = MagicMock()
        message.body = job.model_dump_json().encode("utf-8")
        message.ack = AsyncMock()

        await self.job_manager._process_message(message)

        message.ack.assert_called_once()
        self.mock_exchange.publish.assert_called_once()
        call_args = self.mock_exchange.publish.call_args
        self.assertEqual(call_args.kwargs["routing_key"], "test_job_queue_retry")

        published_msg = call_args.args[0]
        published_data = json.loads(published_msg.body.decode("utf-8"))
        self.assertEqual(published_data["retry_count"], 1)

    async def test_worker_failure_exceeding_max_retries_routes_to_dlq(self) -> None:
        failing_worker = DummyWorker(should_fail=True)
        self.job_manager.worker_factory = lambda _: failing_worker

        job = Job(
            job_id="job-dlq",
            store_id="store-dlq",
            type=JobType.WEB_BUILDER_STORE_INIT,
            retry_count=3,
            max_retries=3,
            payload=JobPayload(prompt="DLQ store"),
        )
        message = MagicMock()
        message.body = job.model_dump_json().encode("utf-8")
        message.ack = AsyncMock()

        await self.job_manager._process_message(message)

        message.ack.assert_called_once()
        self.mock_exchange.publish.assert_called_once()
        call_args = self.mock_exchange.publish.call_args
        self.assertEqual(call_args.kwargs["routing_key"], "test_job_queue_dlq")

    def test_default_worker_map_contains_init_worker(self) -> None:
        self.assertIn(JobType.WEB_BUILDER_STORE_INIT, WORKER_MAP)
        self.assertEqual(WORKER_MAP[JobType.WEB_BUILDER_STORE_INIT], StoreInitWorker)
        self.assertEqual(JobManager.WORKER_MAP, WORKER_MAP)

    def test_get_worker_with_default_worker_map(self) -> None:
        manager_no_executor = JobManager(
            rabbitmq_config=self.rabbitmq_config,
            command_executor=None,
        )
        with self.assertRaises(RuntimeError) as ctx:
            manager_no_executor._get_worker(JobType.WEB_BUILDER_STORE_INIT)
        self.assertIn("CommandExecutionManager is not configured for StoreInitWorker", str(ctx.exception))

        mock_executor = MagicMock()
        mock_s3 = MagicMock()
        manager_with_executor = JobManager(
            rabbitmq_config=self.rabbitmq_config,
            command_executor=mock_executor,
            s3_client=mock_s3,
        )
        worker = manager_with_executor._get_worker(JobType.WEB_BUILDER_STORE_INIT)
        self.assertIsInstance(worker, StoreInitWorker)

    def test_get_worker_with_custom_worker_map(self) -> None:
        custom_map: dict[JobType, type[BaseJobWorker]] = {
            JobType.WEB_BUILDER_STORE_INIT: DummyWorker,
        }
        manager = JobManager(
            rabbitmq_config=self.rabbitmq_config,
            worker_map=custom_map,
        )
        worker = manager._get_worker(JobType.WEB_BUILDER_STORE_INIT)
        self.assertIsInstance(worker, DummyWorker)

    def test_get_worker_unimplemented_type_raises(self) -> None:
        manager = JobManager(rabbitmq_config=self.rabbitmq_config)
        with self.assertRaises(NotImplementedError) as ctx:
            manager._get_worker(JobType.WEB_BUILDER_STORE_DEVELOP)
        self.assertIn("WEB_BUILDER_STORE_DEVELOP worker is not implemented yet", str(ctx.exception))

    def test_get_worker_unsupported_type_raises(self) -> None:
        manager = JobManager(
            rabbitmq_config=self.rabbitmq_config,
            worker_map={},
        )
        with self.assertRaises(ValueError) as ctx:
            manager._get_worker(JobType.WEB_BUILDER_STORE_INIT)
        self.assertIn("Unsupported job type", str(ctx.exception))

    def test_instantiate_worker_invalid_signature_raises(self) -> None:
        manager = JobManager(
            rabbitmq_config=self.rabbitmq_config,
            worker_map={JobType.WEB_BUILDER_STORE_INIT: ParameterizedWorker},
        )
        with self.assertRaises(ValueError) as ctx:
            manager._get_worker(JobType.WEB_BUILDER_STORE_INIT)
        self.assertIn("Unable to instantiate worker class", str(ctx.exception))

    async def test_start_and_stop_lifecycle(self) -> None:
        mock_conn = MagicMock()
        mock_channel = MagicMock()
        mock_channel.set_qos = AsyncMock()
        mock_channel.is_closed = False
        mock_channel.close = AsyncMock()
        mock_conn.is_closed = False
        mock_conn.close = AsyncMock()

        mock_main_q = MagicMock()
        mock_main_q.consume = AsyncMock(return_value="tag-123")
        mock_main_q.cancel = AsyncMock()

        self.rabbitmq_config.connect = AsyncMock(return_value=mock_conn)
        self.rabbitmq_config.get_channel = AsyncMock(return_value=mock_channel)
        self.rabbitmq_config.declare_queues = AsyncMock(
            return_value=(mock_main_q, MagicMock(), MagicMock())
        )

        manager = JobManager(
            rabbitmq_config=self.rabbitmq_config,
            worker_factory=lambda _: self.worker,
        )

        await manager.start()
        self.assertTrue(manager._is_running)
        self.assertEqual(manager.consumer_tag, "tag-123")
        mock_channel.set_qos.assert_called_once_with(prefetch_count=10)
        mock_main_q.consume.assert_called_once()

        await manager.stop()
        self.assertFalse(manager._is_running)
        mock_main_q.cancel.assert_called_once_with("tag-123")
        mock_channel.close.assert_called_once()
        mock_conn.close.assert_called_once()


if __name__ == "__main__":
    unittest.main()

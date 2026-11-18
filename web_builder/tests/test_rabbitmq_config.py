import unittest
from unittest.mock import AsyncMock, MagicMock

from src.config.rabbitmq import RabbitMQConfig
from src.settings import Settings


class TestRabbitMQConfig(unittest.IsolatedAsyncioTestCase):
    def test_settings_connection_uri_building(self) -> None:
        custom_settings = Settings(
            RABBITMQ_HOST="rabbitmq.internal",
            RABBITMQ_PORT=5673,
            RABBITMQ_USER="easeinv_user",
            RABBITMQ_PASSWORD="p@ss:word%",
            WEB_BUILDER_JOB_QUEUE="custom_queue",
            RABBITMQ_RETRY_DELAY_MS=6000,
        )
        self.assertEqual(
            custom_settings.RABBITMQ_CONNECTION_URI,
            "amqp://easeinv_user:p%40ss%3Aword%25@rabbitmq.internal:5673",
        )

        config = RabbitMQConfig.from_settings(custom_settings)
        self.assertEqual(
            config.connection_uri,
            "amqp://easeinv_user:p%40ss%3Aword%25@rabbitmq.internal:5673",
        )
        self.assertEqual(config.job_queue_name, "custom_queue")
        self.assertEqual(config.retry_delay_ms, 6000)

    def test_queue_names(self) -> None:
        config = RabbitMQConfig(
            connection_uri="amqp://localhost",
            job_queue_name="test_queue",
            retry_delay_ms=3000,
        )
        self.assertEqual(config.job_queue_name, "test_queue")
        self.assertEqual(config.retry_queue_name, "test_queue_retry")
        self.assertEqual(config.dlq_name, "test_queue_dlq")

    async def test_declare_queues(self) -> None:
        config = RabbitMQConfig(
            connection_uri="amqp://localhost",
            job_queue_name="orders",
            retry_delay_ms=4000,
        )
        channel = MagicMock()
        channel.declare_queue = AsyncMock(
            side_effect=[
                MagicMock(name="dlq"),
                MagicMock(name="retry"),
                MagicMock(name="main"),
            ]
        )

        main_q, retry_q, dlq = await config.declare_queues(channel)
        self.assertEqual(channel.declare_queue.call_count, 3)

        dlq_call = channel.declare_queue.call_args_list[0]
        self.assertEqual(dlq_call.args[0], "orders_dlq")
        self.assertTrue(dlq_call.kwargs["durable"])

        retry_call = channel.declare_queue.call_args_list[1]
        self.assertEqual(retry_call.args[0], "orders_retry")
        self.assertEqual(
            retry_call.kwargs["arguments"]["x-dead-letter-routing-key"], "orders"
        )
        self.assertEqual(retry_call.kwargs["arguments"]["x-message-ttl"], 4000)

        main_call = channel.declare_queue.call_args_list[2]
        self.assertEqual(main_call.args[0], "orders")
        self.assertEqual(
            main_call.kwargs["arguments"]["x-dead-letter-routing-key"], "orders_retry"
        )


if __name__ == "__main__":
    unittest.main()

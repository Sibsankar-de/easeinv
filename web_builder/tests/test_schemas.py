from datetime import datetime, timezone
import unittest
from pydantic import ValidationError

from src.schemas.job import Job, JobPayload, JobType


class TestJobSchemas(unittest.TestCase):
    def test_job_type_enum(self) -> None:
        self.assertEqual(JobType.WEB_BUILDER_STORE_INIT, "WEB_BUILDER_STORE_INIT")
        self.assertEqual(JobType.WEB_BUILDER_STORE_DEVELOP, "WEB_BUILDER_STORE_DEVELOP")

    def test_job_model_valid(self) -> None:
        job = Job(
            job_id="job-123",
            store_id="store-456",
            type=JobType.WEB_BUILDER_STORE_INIT,
            payload=JobPayload(prompt="Build a minimalist apparel shop"),
        )
        self.assertEqual(job.job_id, "job-123")
        self.assertEqual(job.store_id, "store-456")
        self.assertEqual(job.type, JobType.WEB_BUILDER_STORE_INIT)
        self.assertEqual(job.retry_count, 0)
        self.assertEqual(job.max_retries, 3)
        self.assertIsNone(job.expiry)
        self.assertEqual(job.payload.prompt, "Build a minimalist apparel shop")

    def test_job_serialization_roundtrip(self) -> None:
        now = datetime.now(timezone.utc)
        job = Job(
            job_id="job-999",
            store_id="store-888",
            type=JobType.WEB_BUILDER_STORE_DEVELOP,
            retry_count=1,
            max_retries=5,
            expiry=now,
            payload=JobPayload(prompt="Add hero section banner"),
        )
        json_str = job.model_dump_json()
        restored = Job.model_validate_json(json_str)

        self.assertEqual(restored.job_id, "job-999")
        self.assertEqual(restored.store_id, "store-888")
        self.assertEqual(restored.type, JobType.WEB_BUILDER_STORE_DEVELOP)
        self.assertEqual(restored.retry_count, 1)
        self.assertEqual(restored.max_retries, 5)
        self.assertEqual(restored.payload.prompt, "Add hero section banner")

    def test_job_validation_error_missing_fields(self) -> None:
        with self.assertRaises(ValidationError):
            Job.model_validate({"job_id": "job-1"})

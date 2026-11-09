from typing import Protocol, runtime_checkable
import boto3
from botocore.client import BaseClient, Config

from src.settings import Settings, settings


@runtime_checkable
class S3ClientProvider(Protocol):
    def create_client(self) -> BaseClient: ...


class S3Config:
    def __init__(
        self,
        endpoint_url: str,
        access_key_id: str,
        secret_access_key: str,
        region_name: str,
        bucket_name: str,
    ) -> None:
        self.endpoint_url: str = endpoint_url
        self.access_key_id: str = access_key_id
        self.secret_access_key: str = secret_access_key
        self.region_name: str = region_name
        self.bucket_name: str = bucket_name

    @classmethod
    def from_settings(cls, app_settings: Settings = settings) -> "S3Config":
        return cls(
            endpoint_url=app_settings.S3_ENDPOINT_URL,
            access_key_id=app_settings.S3_ACCESS_KEY_ID,
            secret_access_key=app_settings.S3_SECRET_ACCESS_KEY,
            region_name=app_settings.S3_REGION_NAME,
            bucket_name=app_settings.S3_BUCKET_NAME,
        )

    def create_client(self) -> BaseClient:
        return boto3.client(
            service_name="s3",
            endpoint_url=self.endpoint_url,
            aws_access_key_id=self.access_key_id,
            aws_secret_access_key=self.secret_access_key,
            region_name=self.region_name,
            config=Config(signature_version="s3v4", s3={"addressing_style": "path"}),
        )


def get_s3_config() -> S3Config:
    return S3Config.from_settings()


def get_s3_client() -> BaseClient:
    return get_s3_config().create_client()

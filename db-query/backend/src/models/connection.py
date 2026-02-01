"""Connection models."""

from datetime import datetime
from uuid import UUID

from pydantic import Field, field_validator

from . import CamelModel
from .metadata import DatabaseType


class Connection(CamelModel):
    """Connection model (response)."""

    id: UUID
    name: str
    database_type: DatabaseType = Field(alias="databaseType")
    created_at: datetime = Field(alias="createdAt")
    last_accessed_at: datetime | None = Field(default=None, alias="lastAccessedAt")
    # Note: connection_url excluded from response for security


class ConnectionCreate(CamelModel):
    """Connection creation request model."""

    name: str = Field(min_length=1, max_length=100)
    connection_url: str = Field(alias="connectionUrl")

    @field_validator("connection_url")
    @classmethod
    def validate_connection_url(cls, v: str) -> str:
        """Validate connection URL format."""
        if v.startswith("postgresql://") or v.startswith("postgres://"):
            return v
        elif v.startswith("mysql://") or v.startswith("mysql+pymysql://"):
            return v
        else:
            raise ValueError(
                "Connection URL must start with 'postgresql://', 'postgres://', "
                "'mysql://', or 'mysql+pymysql://'"
            )


class ConnectionUpdate(CamelModel):
    """Connection update request model."""

    name: str = Field(min_length=1, max_length=100)

"""Database metadata models."""

from datetime import datetime
from enum import Enum
from uuid import UUID

from pydantic import Field

from . import CamelModel


class DatabaseType(str, Enum):
    """Database type."""

    POSTGRESQL = "postgresql"
    MYSQL = "mysql"


class TableType(str, Enum):
    """Table or view type."""

    TABLE = "table"
    VIEW = "view"


class ForeignKeyRef(CamelModel):
    """Foreign key reference."""

    table: str
    column: str


class ColumnInfo(CamelModel):
    """Column information."""

    name: str
    data_type: str = Field(alias="dataType")
    is_nullable: bool = Field(alias="isNullable")
    is_primary_key: bool = Field(alias="isPrimaryKey")
    foreign_key: ForeignKeyRef | None = Field(default=None, alias="foreignKey")
    default_value: str | None = Field(default=None, alias="defaultValue")


class TableInfo(CamelModel):
    """Table or view information."""

    name: str
    type: TableType
    columns: list[ColumnInfo]
    row_count_estimate: int | None = Field(default=None, alias="rowCountEstimate")


class DatabaseMetadata(CamelModel):
    """Database metadata response."""

    id: UUID
    connection_id: UUID = Field(alias="connectionId")
    tables: list[TableInfo]
    extracted_at: datetime = Field(alias="extractedAt")

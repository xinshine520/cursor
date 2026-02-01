"""Query models."""

from typing import Any

from pydantic import Field

from . import CamelModel


class QueryRequest(CamelModel):
    """SQL query request model."""

    sql: str = Field(min_length=1)


class QueryResult(CamelModel):
    """Query execution result model."""

    columns: list[str]
    rows: list[dict[str, Any]]
    row_count: int = Field(alias="rowCount")
    truncated: bool
    duration_ms: int = Field(alias="durationMs")


class NaturalLanguageQueryRequest(CamelModel):
    """Natural language query request model."""

    query: str = Field(min_length=1, description="Natural language description of the query")


class GeneratedQuery(CamelModel):
    """Generated SQL query response model."""

    sql: str
    explanation: str

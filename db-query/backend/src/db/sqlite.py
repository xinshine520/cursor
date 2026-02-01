"""SQLite database module with async connection pool."""

import aiosqlite
from pathlib import Path

from ..config import settings


# SQLite schema initialization
SCHEMA_SQL = """
-- Connections table
CREATE TABLE IF NOT EXISTS connections (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    connection_url_encrypted TEXT NOT NULL,
    database_type TEXT NOT NULL DEFAULT 'postgresql',
    created_at TEXT NOT NULL,
    last_accessed_at TEXT
);

-- Metadata cache table
CREATE TABLE IF NOT EXISTS metadata_cache (
    id TEXT PRIMARY KEY,
    connection_id TEXT NOT NULL UNIQUE REFERENCES connections(id) ON DELETE CASCADE,
    tables_json TEXT NOT NULL,
    extracted_at TEXT NOT NULL
);

-- Index for connection lookup
CREATE INDEX IF NOT EXISTS idx_metadata_connection ON metadata_cache(connection_id);
"""


class SQLitePool:
    """Async SQLite connection pool."""

    def __init__(self, db_path: str) -> None:
        """Initialize SQLite pool with database path."""
        self.db_path = Path(db_path)
        self.db_path.parent.mkdir(parents=True, exist_ok=True)
        self._connection: aiosqlite.Connection | None = None

    async def initialize(self) -> None:
        """Initialize database connection and schema."""
        self._connection = await aiosqlite.connect(self.db_path)
        self._connection.row_factory = aiosqlite.Row
        await self._connection.executescript(SCHEMA_SQL)
        await self._connection.commit()

    async def close(self) -> None:
        """Close database connection."""
        if self._connection:
            await self._connection.close()

    async def execute(
        self, query: str, parameters: tuple | None = None
    ) -> aiosqlite.Cursor:
        """Execute a query."""
        if not self._connection:
            raise RuntimeError("Database not initialized. Call initialize() first.")
        return await self._connection.execute(query, parameters or ())

    async def executemany(
        self, query: str, parameters: list[tuple]
    ) -> aiosqlite.Cursor:
        """Execute a query multiple times."""
        if not self._connection:
            raise RuntimeError("Database not initialized. Call initialize() first.")
        return await self._connection.executemany(query, parameters)

    async def fetch_one(self, query: str, parameters: tuple | None = None) -> aiosqlite.Row | None:
        """Fetch a single row."""
        cursor = await self.execute(query, parameters)
        return await cursor.fetchone()

    async def fetch_all(self, query: str, parameters: tuple | None = None) -> list[aiosqlite.Row]:
        """Fetch all rows."""
        cursor = await self.execute(query, parameters)
        return await cursor.fetchall()

    async def commit(self) -> None:
        """Commit current transaction."""
        if self._connection:
            await self._connection.commit()


# Global database pool instance
db_pool = SQLitePool(settings.database_path)

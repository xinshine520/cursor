"""Connection service for CRUD operations."""

import json
from datetime import datetime, timezone
from uuid import UUID, uuid4

from cryptography.fernet import Fernet
from cryptography.hazmat.primitives import hashes
from cryptography.hazmat.primitives.kdf.pbkdf2 import PBKDF2HMAC
import base64

from ..config import settings
from ..db.sqlite import db_pool
from ..models.connection import Connection, ConnectionCreate, ConnectionUpdate
from ..models.errors import ErrorDetail, ErrorResponse
from ..models.metadata import DatabaseType


def _get_encryption_key() -> bytes:
    """Generate encryption key from settings."""
    # Use a simple key derivation from database path
    kdf = PBKDF2HMAC(
        algorithm=hashes.SHA256(),
        length=32,
        salt=b"db_query_salt",
        iterations=100000,
    )
    key = base64.urlsafe_b64encode(kdf.derive(settings.database_path.encode()))
    return key


def _encrypt_url(url: str) -> str:
    """Encrypt connection URL."""
    fernet = Fernet(_get_encryption_key())
    return fernet.encrypt(url.encode()).decode()


def _decrypt_url(encrypted_url: str) -> str:
    """Decrypt connection URL."""
    fernet = Fernet(_get_encryption_key())
    return fernet.decrypt(encrypted_url.encode()).decode()


class ConnectionService:
    """Service for managing database connections."""

    @staticmethod
    def _detect_database_type(connection_url: str) -> DatabaseType:
        """Detect database type from connection URL."""
        if connection_url.startswith("postgresql://") or connection_url.startswith("postgres://"):
            return DatabaseType.POSTGRESQL
        elif connection_url.startswith("mysql://") or connection_url.startswith("mysql+pymysql://"):
            return DatabaseType.MYSQL
        else:
            raise ValueError(f"Unsupported database type in URL: {connection_url}")

    @staticmethod
    async def create(connection_data: ConnectionCreate) -> Connection:
        """Create a new connection."""
        connection_id = uuid4()
        now = datetime.now(timezone.utc)
        encrypted_url = _encrypt_url(connection_data.connection_url)
        database_type = ConnectionService._detect_database_type(connection_data.connection_url)

        # Check for duplicate name
        existing = await db_pool.fetch_one(
            "SELECT id FROM connections WHERE name = ?", (connection_data.name,)
        )
        if existing:
            raise ValueError(f"Connection with name '{connection_data.name}' already exists")

        await db_pool.execute(
            """INSERT INTO connections (id, name, connection_url_encrypted, database_type, created_at)
               VALUES (?, ?, ?, ?, ?)""",
            (str(connection_id), connection_data.name, encrypted_url, database_type.value, now.isoformat()),
        )
        await db_pool.commit()

        return Connection(
            id=connection_id,
            name=connection_data.name,
            database_type=database_type,
            created_at=now,
            last_accessed_at=None,
        )

    @staticmethod
    async def get_by_id(connection_id: UUID) -> Connection | None:
        """Get connection by ID."""
        row = await db_pool.fetch_one(
            "SELECT id, name, database_type, created_at, last_accessed_at FROM connections WHERE id = ?",
            (str(connection_id),),
        )
        if not row:
            return None

        # aiosqlite.Row supports dictionary-style access but not .get()
        # Check if column exists by trying to access it
        try:
            database_type_value = row["database_type"] or "postgresql"
        except (KeyError, IndexError):
            database_type_value = "postgresql"

        return Connection(
            id=UUID(row["id"]),
            name=row["name"],
            database_type=DatabaseType(database_type_value),
            created_at=datetime.fromisoformat(row["created_at"]),
            last_accessed_at=datetime.fromisoformat(row["last_accessed_at"])
            if row["last_accessed_at"]
            else None,
        )

    @staticmethod
    async def get_connection_url(connection_id: UUID) -> str:
        """Get decrypted connection URL."""
        row = await db_pool.fetch_one(
            "SELECT connection_url_encrypted FROM connections WHERE id = ?",
            (str(connection_id),),
        )
        if not row:
            raise ValueError(f"Connection {connection_id} not found")

        return _decrypt_url(row["connection_url_encrypted"])

    @staticmethod
    async def get_database_type(connection_id: UUID) -> DatabaseType:
        """Get database type for connection."""
        row = await db_pool.fetch_one(
            "SELECT database_type FROM connections WHERE id = ?",
            (str(connection_id),),
        )
        if not row:
            raise ValueError(f"Connection {connection_id} not found")

        # aiosqlite.Row supports dictionary-style access but not .get()
        # Check if column exists by trying to access it
        try:
            database_type_value = row["database_type"] or "postgresql"
        except (KeyError, IndexError):
            database_type_value = "postgresql"
        return DatabaseType(database_type_value)

    @staticmethod
    async def list_all() -> list[Connection]:
        """List all connections."""
        rows = await db_pool.fetch_all(
            "SELECT id, name, database_type, created_at, last_accessed_at FROM connections ORDER BY created_at DESC"
        )

        result = []
        for row in rows:
            # aiosqlite.Row supports dictionary-style access but not .get()
            # Check if column exists by trying to access it
            try:
                database_type_value = row["database_type"] or "postgresql"
            except (KeyError, IndexError):
                database_type_value = "postgresql"
            
            result.append(
                Connection(
                    id=UUID(row["id"]),
                    name=row["name"],
                    database_type=DatabaseType(database_type_value),
                    created_at=datetime.fromisoformat(row["created_at"]),
                    last_accessed_at=datetime.fromisoformat(row["last_accessed_at"])
                    if row["last_accessed_at"]
                    else None,
                )
            )
        return result

    @staticmethod
    async def delete(connection_id: UUID) -> None:
        """Delete a connection."""
        result = await db_pool.execute(
            "DELETE FROM connections WHERE id = ?", (str(connection_id),)
        )
        await db_pool.commit()

        if result.rowcount == 0:
            raise ValueError(f"Connection {connection_id} not found")

    @staticmethod
    async def update(connection_id: UUID, update_data: ConnectionUpdate) -> Connection:
        """Update connection name."""
        # Check for duplicate name (excluding current connection)
        existing = await db_pool.fetch_one(
            "SELECT id FROM connections WHERE name = ? AND id != ?",
            (update_data.name, str(connection_id)),
        )
        if existing:
            raise ValueError(f"Connection with name '{update_data.name}' already exists")

        await db_pool.execute(
            "UPDATE connections SET name = ? WHERE id = ?",
            (update_data.name, str(connection_id)),
        )
        await db_pool.commit()

        # Return updated connection
        updated = await ConnectionService.get_by_id(connection_id)
        if not updated:
            raise ValueError(f"Connection {connection_id} not found after update")
        return updated

    @staticmethod
    async def update_last_accessed(connection_id: UUID) -> None:
        """Update last accessed timestamp."""
        await db_pool.execute(
            "UPDATE connections SET last_accessed_at = ? WHERE id = ?",
            (datetime.now(timezone.utc).isoformat(), str(connection_id)),
        )
        await db_pool.commit()

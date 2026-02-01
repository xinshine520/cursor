"""Metadata service for extracting and caching database schema."""

import json
from datetime import datetime, timezone
from uuid import UUID, uuid4

import asyncpg

from ..db.sqlite import db_pool
from ..models.metadata import (
    ColumnInfo,
    DatabaseMetadata,
    DatabaseType,
    ForeignKeyRef,
    TableInfo,
    TableType,
)


class MetadataService:
    """Service for extracting and caching database metadata."""

    @staticmethod
    async def extract_metadata(connection_id: UUID) -> DatabaseMetadata:
        """Extract metadata from database (PostgreSQL or MySQL)."""
        # Import here to avoid circular dependency
        from ..services.connection_service import ConnectionService
        from ..services.mysql_metadata_service import MySQLMetadataService
        
        database_type = await ConnectionService.get_database_type(connection_id)
        
        if database_type == DatabaseType.MYSQL:
            return await MySQLMetadataService.extract_metadata(connection_id)
        
        # Default to PostgreSQL
        connection_url = await ConnectionService.get_connection_url(connection_id)

        # Connect to PostgreSQL
        conn = await asyncpg.connect(connection_url)

        try:
            # Get all tables and views
            tables_query = """
                SELECT table_name, table_type
                FROM information_schema.tables
                WHERE table_schema = 'public'
                ORDER BY table_name
            """
            table_rows = await conn.fetch(tables_query)

            tables: list[TableInfo] = []

            for table_row in table_rows:
                table_name = table_row["table_name"]
                table_type = (
                    TableType.TABLE
                    if table_row["table_type"] == "BASE TABLE"
                    else TableType.VIEW
                )

                # Get columns
                columns_query = """
                    SELECT
                        column_name,
                        data_type,
                        is_nullable,
                        column_default
                    FROM information_schema.columns
                    WHERE table_schema = 'public' AND table_name = $1
                    ORDER BY ordinal_position
                """
                column_rows = await conn.fetch(columns_query, table_name)

                # Get primary keys
                pk_query = """
                    SELECT kcu.column_name
                    FROM information_schema.table_constraints tc
                    JOIN information_schema.key_column_usage kcu
                        ON tc.constraint_name = kcu.constraint_name
                        AND tc.table_schema = kcu.table_schema
                    WHERE tc.table_schema = 'public'
                        AND tc.table_name = $1
                        AND tc.constraint_type = 'PRIMARY KEY'
                """
                pk_rows = await conn.fetch(pk_query, table_name)
                pk_columns = {row["column_name"] for row in pk_rows}

                # Get foreign keys
                fk_query = """
                    SELECT
                        kcu.column_name,
                        ccu.table_name AS foreign_table_name,
                        ccu.column_name AS foreign_column_name
                    FROM information_schema.table_constraints tc
                    JOIN information_schema.key_column_usage kcu
                        ON tc.constraint_name = kcu.constraint_name
                        AND tc.table_schema = kcu.table_schema
                    JOIN information_schema.constraint_column_usage ccu
                        ON tc.constraint_name = ccu.constraint_name
                        AND tc.table_schema = ccu.table_schema
                    WHERE tc.table_schema = 'public'
                        AND tc.table_name = $1
                        AND tc.constraint_type = 'FOREIGN KEY'
                """
                fk_rows = await conn.fetch(fk_query, table_name)
                fk_map = {
                    row["column_name"]: ForeignKeyRef(
                        table=row["foreign_table_name"], column=row["foreign_column_name"]
                    )
                    for row in fk_rows
                }

                # Build column info
                columns: list[ColumnInfo] = []
                for col_row in column_rows:
                    col_name = col_row["column_name"]
                    columns.append(
                        ColumnInfo(
                            name=col_name,
                            data_type=col_row["data_type"],
                            is_nullable=col_row["is_nullable"] == "YES",
                            is_primary_key=col_name in pk_columns,
                            foreign_key=fk_map.get(col_name),
                            default_value=col_row["column_default"],
                        )
                    )

                # Get row count estimate (for tables only)
                row_count_estimate = None
                if table_type == TableType.TABLE:
                    try:
                        count_row = await conn.fetchrow(
                            f'SELECT COUNT(*) as count FROM "{table_name}"'
                        )
                        row_count_estimate = count_row["count"] if count_row else None
                    except Exception:
                        # Ignore errors getting row count
                        pass

                tables.append(
                    TableInfo(
                        name=table_name,
                        type=table_type,
                        columns=columns,
                        row_count_estimate=row_count_estimate,
                    )
                )

            # Create metadata object
            metadata_id = uuid4()
            extracted_at = datetime.now(timezone.utc)

            metadata = DatabaseMetadata(
                id=metadata_id,
                connection_id=connection_id,
                tables=tables,
                extracted_at=extracted_at,
            )

            # Cache in SQLite
            await MetadataService._cache_metadata(connection_id, metadata)

            return metadata

        finally:
            await conn.close()

    @staticmethod
    async def _cache_metadata(
        connection_id: UUID, metadata: DatabaseMetadata
    ) -> None:
        """Cache metadata in SQLite."""
        metadata_id = metadata.id
        tables_json = json.dumps(
            [table.model_dump(by_alias=True) for table in metadata.tables],
            default=str,
        )
        extracted_at = metadata.extracted_at.isoformat()

        # Upsert metadata
        await db_pool.execute(
            """INSERT INTO metadata_cache (id, connection_id, tables_json, extracted_at)
               VALUES (?, ?, ?, ?)
               ON CONFLICT(connection_id) DO UPDATE SET
                   id = excluded.id,
                   tables_json = excluded.tables_json,
                   extracted_at = excluded.extracted_at""",
            (str(metadata_id), str(connection_id), tables_json, extracted_at),
        )
        await db_pool.commit()

    @staticmethod
    async def get_cached_metadata(connection_id: UUID) -> DatabaseMetadata | None:
        """Get cached metadata from SQLite."""
        row = await db_pool.fetch_one(
            "SELECT id, tables_json, extracted_at FROM metadata_cache WHERE connection_id = ?",
            (str(connection_id),),
        )

        if not row:
            return None

        tables_data = json.loads(row["tables_json"])
        tables = [TableInfo(**table_data) for table_data in tables_data]

        return DatabaseMetadata(
            id=UUID(row["id"]),
            connection_id=connection_id,
            tables=tables,
            extracted_at=datetime.fromisoformat(row["extracted_at"]),
        )

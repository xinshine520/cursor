"""MySQL metadata extraction service."""

from uuid import UUID

import aiomysql
from urllib.parse import urlparse, parse_qs

from ..models.metadata import (
    ColumnInfo,
    DatabaseMetadata,
    ForeignKeyRef,
    TableInfo,
    TableType,
)
from ..services.connection_service import ConnectionService


def _parse_mysql_url(url: str) -> dict[str, str | int]:
    """Parse MySQL connection URL into connection parameters."""
    parsed = urlparse(url)
    
    # Handle mysql:// and mysql+pymysql:// schemes
    if url.startswith("mysql+pymysql://"):
        url = url.replace("mysql+pymysql://", "mysql://", 1)
        parsed = urlparse(url)
    
    config = {
        "host": parsed.hostname or "localhost",
        "port": parsed.port or 3306,
        "user": parsed.username or "root",
        "password": parsed.password or "",
        "db": parsed.path.lstrip("/") if parsed.path else None,
    }
    
    # Parse query parameters
    if parsed.query:
        query_params = parse_qs(parsed.query)
        if "charset" in query_params:
            config["charset"] = query_params["charset"][0]
        else:
            config["charset"] = "utf8mb4"
    
    return config


class MySQLMetadataService:
    """Service for extracting MySQL database metadata."""

    @staticmethod
    async def extract_metadata(connection_id: UUID) -> DatabaseMetadata:
        """Extract metadata from MySQL database."""
        from datetime import datetime, timezone
        from uuid import uuid4
        
        connection_url = await ConnectionService.get_connection_url(connection_id)
        config = _parse_mysql_url(connection_url)
        
        if not config["db"]:
            raise ValueError("Database name is required in MySQL connection URL")

        # Connect to MySQL
        conn = await aiomysql.connect(
            host=config["host"],
            port=config["port"],
            user=config["user"],
            password=config["password"],
            db=config["db"],
            charset=config.get("charset", "utf8mb4"),
        )

        try:
            async with conn.cursor(aiomysql.DictCursor) as cursor:
                # Get all tables and views
                await cursor.execute("""
                    SELECT table_name, table_type
                    FROM information_schema.tables
                    WHERE table_schema = %s
                    ORDER BY table_name
                """, (config["db"],))
                table_rows = await cursor.fetchall()

                tables: list[TableInfo] = []

                for table_row in table_rows:
                    # Handle case-insensitive field access for MySQL
                    # DictCursor should return dict, but field names might vary in case
                    if not isinstance(table_row, dict):
                        raise ValueError(f"Expected dict from DictCursor, got {type(table_row)}")
                    
                    # Try different case variations
                    table_name = None
                    table_type_str = None
                    
                    for key in table_row.keys():
                        key_lower = key.lower()
                        if key_lower == "table_name":
                            table_name = table_row[key]
                        elif key_lower == "table_type":
                            table_type_str = table_row[key]
                    
                    # Fallback: use first two values if keys not found
                    if not table_name:
                        values = list(table_row.values())
                        if len(values) >= 1:
                            table_name = values[0]
                    if not table_type_str:
                        values = list(table_row.values())
                        if len(values) >= 2:
                            table_type_str = values[1]
                        else:
                            table_type_str = "BASE TABLE"
                    
                    if not table_name:
                        continue  # Skip if we can't get table name
                    
                    table_type = (
                        TableType.TABLE
                        if table_type_str == "BASE TABLE"
                        else TableType.VIEW
                    )

                    # Get columns
                    await cursor.execute("""
                        SELECT
                            column_name,
                            data_type,
                            is_nullable,
                            column_default,
                            column_type
                        FROM information_schema.columns
                        WHERE table_schema = %s AND table_name = %s
                        ORDER BY ordinal_position
                    """, (config["db"], table_name))
                    column_rows = await cursor.fetchall()

                    # Get primary keys
                    await cursor.execute("""
                        SELECT kcu.column_name
                        FROM information_schema.table_constraints tc
                        JOIN information_schema.key_column_usage kcu
                            ON tc.constraint_name = kcu.constraint_name
                            AND tc.table_schema = kcu.table_schema
                            AND tc.table_name = kcu.table_name
                        WHERE tc.table_schema = %s
                            AND tc.table_name = %s
                            AND tc.constraint_type = 'PRIMARY KEY'
                    """, (config["db"], table_name))
                    pk_rows = await cursor.fetchall()
                    pk_columns = set()
                    for row in pk_rows:
                        col_name = row.get("column_name") or row.get("COLUMN_NAME") or row.get("Column_name")
                        if col_name:
                            pk_columns.add(col_name)
                        elif row:
                            # Fallback: use first value
                            pk_columns.add(list(row.values())[0])

                    # Get foreign keys
                    await cursor.execute("""
                        SELECT
                            kcu.column_name,
                            kcu.referenced_table_name AS foreign_table_name,
                            kcu.referenced_column_name AS foreign_column_name
                        FROM information_schema.table_constraints tc
                        JOIN information_schema.key_column_usage kcu
                            ON tc.constraint_name = kcu.constraint_name
                            AND tc.table_schema = kcu.table_schema
                            AND tc.table_name = kcu.table_name
                        WHERE tc.table_schema = %s
                            AND tc.table_name = %s
                            AND tc.constraint_type = 'FOREIGN KEY'
                    """, (config["db"], table_name))
                    fk_rows = await cursor.fetchall()
                    fk_map = {}
                    for row in fk_rows:
                        col_name = row.get("column_name") or row.get("COLUMN_NAME") or row.get("Column_name")
                        foreign_table = row.get("foreign_table_name") or row.get("FOREIGN_TABLE_NAME") or row.get("Foreign_table_name")
                        foreign_column = row.get("foreign_column_name") or row.get("FOREIGN_COLUMN_NAME") or row.get("Foreign_column_name")
                        
                        if col_name and foreign_table and foreign_column:
                            fk_map[col_name] = ForeignKeyRef(
                                table=foreign_table,
                                column=foreign_column
                            )

                    # Build column info
                    columns: list[ColumnInfo] = []
                    for col_row in column_rows:
                        # Handle case-insensitive field access
                        col_name = col_row.get("column_name") or col_row.get("COLUMN_NAME") or col_row.get("Column_name")
                        if not col_name:
                            col_name = list(col_row.values())[0] if col_row else None
                        if not col_name:
                            continue
                        
                        data_type = col_row.get("data_type") or col_row.get("DATA_TYPE") or col_row.get("Data_type") or ""
                        is_nullable_str = col_row.get("is_nullable") or col_row.get("IS_NULLABLE") or col_row.get("Is_nullable") or "NO"
                        column_default = col_row.get("column_default") or col_row.get("COLUMN_DEFAULT") or col_row.get("Column_default")
                        
                        columns.append(
                            ColumnInfo(
                                name=col_name,
                                data_type=data_type,
                                is_nullable=is_nullable_str == "YES",
                                is_primary_key=col_name in pk_columns,
                                foreign_key=fk_map.get(col_name),
                                default_value=str(column_default) if column_default is not None else None,
                            )
                        )

                    # Get row count estimate (for tables only)
                    row_count_estimate = None
                    if table_type == TableType.TABLE:
                        try:
                            await cursor.execute(f'SELECT COUNT(*) as count FROM `{table_name}`')
                            count_row = await cursor.fetchone()
                            if count_row:
                                row_count_estimate = count_row.get("count") or count_row.get("COUNT") or count_row.get("Count")
                                if row_count_estimate is None and count_row:
                                    # Fallback: use first value
                                    row_count_estimate = list(count_row.values())[0] if count_row else None
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
            from ..services.metadata_service import MetadataService
            await MetadataService._cache_metadata(connection_id, metadata)

            return metadata

        finally:
            conn.close()
